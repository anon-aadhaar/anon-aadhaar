#!/bin/bash


# default dir
BUILD_DIR=./build
PTAU=powersOfTau28_hez_final_20.ptau
PTAU_PATH=$BUILD_DIR/$PTAU
CIRCUIR_PATH=./circuits/qr_verify.circom
CIRLIB_PATH=./node_modules
R1CS_PATH=$BUILD_DIR/qr_verify.r1cs
QR_VERIFY_DIR=$BUILD_DIR/qr_verify_js
PARTIAL_ZKEYS_DIR=$BUILD_DIR/partial_zkeys
ARTIFACTS_DIR=./artifacts

CIRCOM_BIN_DIR=$HOME/.cargo/bin/circom

# install circom and dependencies
function install_deps() {

    if [ ! -d $BUILD_DIR ]; then
        mkdir -p $BUILD_DIR
    fi

    echo "Install circom"
    cd $BUILD_DIR
    if [ ! -f $CIRCOM_BIN_DIR ]; then
        git clone https://github.com/iden3/circom.git
        cd circom
        cargo build --release
        cargo install --path circom
        echo "Installed circom!"
    else 
        echo "Circom already install... Skip this action!"
    fi 

    echo "Download power of tau...."
    cd $BUILD_DIR
    if [ ! -f $PTAU_PATH ]; then
        wget https://hermez.s3-eu-west-1.amazonaws.com/$PTAU
        echo "Finished download!"
    else 
        echo "Powers of tau file already downloaded... Skip download action!"
    fi 

    echo "Finished install deps!!!!"
}

# trusted setup for development
# DON'T USE IT IN PRODUCT
function dev_trusted_setup() {
    echo "Starting setup...!"

    if [ ! -d $PARTIAL_ZKEYS_DIR ]; then
        mkdir -p $PARTIAL_ZKEYS_DIR
    fi

    echo "TRUSTED SETUP FOR DEVELOPMENT - PLEASE, DON'T USE IT IN PRODUCT!!!!"

    circom ./circuits/qr_verify.circom  --r1cs --wasm -o $BUILD_DIR -l ./node_modules


    NODE_OPTIONS=--max-old-space-size=8192 \
	node ./node_modules/.bin/snarkjs groth16 setup $R1CS_PATH $PTAU_PATH $PARTIAL_ZKEYS_DIR/circuit_0000.zkey

    echo "test random" | NODE_OPTIONS='--max-old-space-size=8192' \
	node ./node_modules/.bin/snarkjs zkey contribute $PARTIAL_ZKEYS_DIR/circuit_0000.zkey $PARTIAL_ZKEYS_DIR/circuit_final.zkey --name="1st Contributor Name" -v 
    NODE_OPTIONS='--max-old-space-size=8192' ./node_modules/.bin/snarkjs zkey export verificationkey $PARTIAL_ZKEYS_DIR/circuit_final.zkey "$BUILD_DIR"/vkey.json

    echo "Copy proving key and verify key to artifacts!!!!"

        if [ ! -d $ARTIFACTS_DIR ]; then
        mkdir -p $ARTIFACTS_DIR
    fi

    cp $QR_VERIFY_DIR/qr_verify.wasm $ARTIFACTS_DIR
    cp $PARTIAL_ZKEYS_DIR/circuit_final.zkey $ARTIFACTS_DIR
    cp $BUILD_DIR/vkey.json $ARTIFACTS_DIR
    
    echo "Setup finished!"
}


function setup_contract() {
    cd $ROOT
    echo "Building contracts...!"
    mkdir -p $BUILD_DIR/contracts
    npx snarkjs zkey export solidityverifier ./build/circuit/RSA/circuit_final.zkey $BUILD_DIR/contracts/Verifier.sol
    # Update the contract name in the Solidity verifier
    sed -i '' -e "s/contract Groth16Verifier/contract Verifier/g" $BUILD_DIR/contracts/Verifier.sol
    cp $BUILD_DIR/contracts/Verifier.sol $CONTRACTS_DIR/contracts
    echo "Contracts generated!"
}

function generate_witness() {
    echo "Gen witness..."
    npx ts-node ./scripts/generateInput.ts
    node $BUILD_DIR/qr_verify_js/generate_witness.js "$BUILD_DIR"/qr_verify_js/qr_verify.wasm  $BUILD_DIR/input.json $BUILD_DIR/witness.wtns
    echo "Done!"
}

function generate_proof() {
    echo "Building proof...!"
    mkdir -p $BUILD_DIR/proofs

    NODE_OPTIONS='--max-old-space-size=8192' ./node_modules/.bin/snarkjs groth16 prove $PARTIAL_ZKEYS_DIR/circuit_final.zkey $BUILD_DIR/witness.wtns $BUILD_DIR/proofs/proof.json $BUILD_DIR/proofs/public.json
    echo "Generated proof...!"

}

function verify_proof() {
    NODE_OPTIONS='--max-old-space-size=8192' ./node_modules/.bin/snarkjs groth16 verify $BUILD_DIR/vkey.json $BUILD_DIR/proofs/public.json $BUILD_DIR/proofs/proof.json
    echo "Verify proof...!"
}

case "$1" in
    install)
        install_deps
    ;;
    setup)
        dev_trusted_setup
    ;;
    gen-proof) 
        generate_proof
    ;;
    gen-witness) 
        generate_witness
    ;;
    verify-proof)
        verify_proof
    ;;
    *)
        echo "Usage: $0 {install|setup|gen-proof|gen-witness|verify-proof}"
    ;;
esac
