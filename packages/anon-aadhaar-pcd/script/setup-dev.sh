#!/bin/bash


# default dir
ROOT=$(pwd)
BUILD_DIR=$(pwd)/build
ARTIFACTS_DIR=$(pwd)/artifacts
POWERS_OF_TAU=$BUILD_DIR/powersOfTau28_hez_final_18.ptau
RSA_DIR=$(pwd)/circuits

CIRCOM_BIN_DIR=$HOME/.cargo/bin/circom

# install circom and depenencies
function install_deps() {
    git submodule update --init --recursive --remote

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
    if [ ! -f $POWERS_OF_TAU ]; then
        wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_18.ptau
        echo "Finished download!"
    else 
        echo "Powers of tau file already downloaded... Skip download action!"
    fi 

    echo "Finished install deps!!!!"
}

# trusted setup for development
# DON'T USE IT IN PRODUCT
function setup_circuit() {
    cd $ROOT
    echo "Starting setup...!"
    HASH=`$ROOT/script/utils.sh`

    echo "TRUSTED SETUP FOR DEVELOPMENT - PLEASE, DON'T USE IT IN PRODUCT!!!!"
    cd $BUILD_DIR 

    CIRCUIT=circuit
    if [ -f $CIRCUIT/hash.txt ]; then 
        OLD_HASH=`cat $CIRCUIT/hash.txt`
        echo $OLD_HASH 
    else 
        OLD_HASH=""
    fi

    cd $RSA_DIR
    if [ "$HASH" != "$OLD_HASH" ]; then 
        mkdir -p $BUILD_DIR/$CIRCUIT
        circom main.circom  --r1cs --wasm -o $BUILD_DIR/$CIRCUIT
        npx snarkjs groth16 setup $BUILD_DIR/$CIRCUIT/main.r1cs $POWERS_OF_TAU $BUILD_DIR/$CIRCUIT/circuit_0000.zkey
        echo "test random" | npx snarkjs zkey contribute $BUILD_DIR/$CIRCUIT/circuit_0000.zkey $BUILD_DIR/$CIRCUIT/circuit_final.zkey
        npx snarkjs zkey export verificationkey $BUILD_DIR/$CIRCUIT/circuit_final.zkey $BUILD_DIR/$CIRCUIT/verification_key.json
    fi 

    echo "Finish setup....!"

    echo "Copy proving key and verify key to artifacts!!!!"

    cd $BUILD_DIR

    if [ ! -d $ARTIFACTS_DIR ]; then
        mkdir -p $ARTIFACTS_DIR
    fi

    cp $CIRCUIT/main_js/main.wasm $ARTIFACTS_DIR
    cp $CIRCUIT/circuit_final.zkey $ARTIFACTS_DIR
    cp $CIRCUIT/verification_key.json $ARTIFACTS_DIR
    echo $HASH > $CIRCUIT/hash.txt
    echo "Setup finished!"
}

function gen_cert_and_key() {
    cd $BUILD_DIR
    openssl req -newkey rsa:2048 -x509 -nodes -keyout cakey.pem -out cacert.pem -days 3650 -subj "/C=GB/ST=London/L=London/O=Global Security/OU=IT Department/CN=example.com"  
    openssl pkcs12 -export -out keyStore.p12 -inkey cakey.pem -in cacert.pem  -passout pass:password
    openssl x509 -inform PEM -in cacert.pem -outform DER -out certificate.cer   
    npx node-signpdf-gen $BUILD_DIR/signed.pdf $BUILD_DIR/keyStore.p12 $BUILD_DIR/certificate.cer
}

function setup_contract() {
    cd $ROOT
    echo "Building contracts...!"
    mkdir -p $BUILD_DIR/contracts
    snarkjs zkey export solidityverifier ./build/circuit/circuit_final.zkey $BUILD_DIR/contracts/Verifier.sol
    # Update the contract name in the Solidity verifier
    sed -i '' -e "s/contract Groth16Verifier/contract Verifier/g" $BUILD_DIR/contracts/Verifier.sol
    echo "Contracts generated!"
}

function generate_proof() {
    cd $ROOT
    echo "Building proof...!"
    mkdir -p $BUILD_DIR/proofs
    snarkjs groth16 fullprove ./build/input.json ./build/circuit/main_js/main.wasm ./build/circuit/circuit_final.zkey $BUILD_DIR/proofs/proof.json $BUILD_DIR/proofs/public.json
    echo "Generated proof...!"
}

case "$1" in
    install)
        install_deps
    ;;
    setup)
        setup_circuit
    ;;
    pdf-setup) 
        gen_cert_and_key
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

