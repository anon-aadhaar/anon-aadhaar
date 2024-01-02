#!/bin/bash


# default dir
BUILD_DIR=./build
PTAU=powersOfTau28_hez_final_20.ptau
PTAU_PATH=$BUILD_DIR/$PTAU
CIRCUIR_PATH=./circuits/qr_verify.circom
CIRLIB_PATH=./node_modules
R1CS_PATH=$BUILD_DIR/qr_verify.r1cs
PARTIAL_ZKEYS_DIR=$BUILD_DIR/partial_zkeys

CIRCOM_BIN_DIR=$HOME/.cargo/bin/circom

# install circom and depenencies
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

    yarn add snarkjs@git+https://github.com/vb7401/snarkjs.git#24981febe8826b6ab76ae4d76cf7f9142919d2b8
	yarn


    NODE_OPTIONS=--max-old-space-size=8192 \
	node ./node_modules/.bin/snarkjs groth16 setup $R1CS_PATH $PTAU_PATH $PARTIAL_ZKEYS_DIR/circuit_0000.zkey

    echo "test random" | NODE_OPTIONS='--max-old-space-size=8192' \
	node ./node_modules/.bin/snarkjs zkey contribute $PARTIAL_ZKEYS_DIR/circuit_0000.zkey $PARTIAL_ZKEYS_DIR/circuit_final.zkey --name="1st Contributor Name" -v 

    yarn remove snarkjs
    yarn add snarkjs@0.7.0
    yarn

    NODE_OPTIONS=--max-old-space-size=8192 \
	node ./node_modules/.bin/snarkjs groth16 setup $R1CS_PATH $PTAU_PATH $PARTIAL_ZKEYS_DIR/circuit_0000.zkey

    echo "test random" | NODE_OPTIONS='--max-old-space-size=8192' \
	node ./node_modules/.bin/snarkjs zkey contribute $PARTIAL_ZKEYS_DIR/circuit_0000.zkey $PARTIAL_ZKEYS_DIR/circuit_final_nonchunk.zkey --name="1st Contributor Name" -v 
    
    yarn add snarkjs@git+https://github.com/vb7401/snarkjs.git#24981febe8826b6ab76ae4d76cf7f9142919d2b8
	yarn

}


function setup_contract() {
    cd $ROOT
    echo "Building contracts...!"
    mkdir -p $BUILD_DIR/contracts
    snarkjs zkey export solidityverifier ./build/circuit/RSA/circuit_final.zkey $BUILD_DIR/contracts/Verifier.sol
    # Update the contract name in the Solidity verifier
    sed -i '' -e "s/contract Groth16Verifier/contract Verifier/g" $BUILD_DIR/contracts/Verifier.sol
    cp $BUILD_DIR/contracts/Verifier.sol $CONTRACTS_DIR/contracts
    echo "Contracts generated!"
}

function generate_proof() {
    cd $ROOT
    echo "Building proof...!"
    mkdir -p $BUILD_DIR/proofs
    npx ts-node ./script/generateInput.ts
    snarkjs groth16 fullprove $BUILD_DIR/input.json $BUILD_DIR/circuit/RSA/main_js/main.wasm $BUILD_DIR/circuit/RSA/circuit_final.zkey $BUILD_DIR/proofs/proof.json $BUILD_DIR/proofs/public.json
    echo "Generated proof...!"
}

case "$1" in
    install)
        install_deps
    ;;
    setup)
        dev_trusted_setup
    ;;
    pdf-setup) 
        gen_cert_and_key $2
    ;;
    contract-setup) 
        setup_contract
    ;;
    gen-proof) 
        generate_proof
    ;;
    *)
        echo "Usage: $0 {install|setup|pdf-setup}"
    ;;
esac
