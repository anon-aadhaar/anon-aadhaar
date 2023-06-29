#!/bin/bash


# default dir
BUILD_DIR=$(pwd)/build
ARTIFACTS_DIR=$(pwd)/artifacts
POWERS_OF_TAU=$BUILD_DIR/powersOfTau28_hez_final_20.ptau
RSA_DIR=$(pwd)/circom-rsa-verify

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
        wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_20.ptau
        echo "Finished download!"
    else 
        echo "Powers of tau file already downloaded... Skip download action!"
    fi 

    echo "Finished install deps!!!!"
}

# trusted setup for development
# DON'T USE IT IN PRODUCT
function setup_circuit() {
    echo "TRUSTED SETUP FOR DEVELOPMENT - PLEASE, DON'T USE IT IN PRODUCT!!!!"
    
    cd $RSA_DIR
    yarn
    
    cd $RSA_DIR/circom-ecdsa
    yarn
    
    echo "Starting setup...!"
    cd $RSA_DIR/test
    circom circuits/rsa_verify_sha1_pkcs1v15.circom  --r1cs --wasm -o $BUILD_DIR
    npx snarkjs groth16 setup $BUILD_DIR/rsa_verify_sha1_pkcs1v15.r1cs $POWERS_OF_TAU $BUILD_DIR/circuit_0000.zkey
    echo "test random" | npx snarkjs zkey contribute $BUILD_DIR/circuit_0000.zkey $BUILD_DIR/circuit_final.zkey
    npx snarkjs zkey export verificationkey $BUILD_DIR/circuit_final.zkey $BUILD_DIR/verification_key.json
    
    echo "Finish setup....!"

    echo "Copy proving key and verify key to artifacts!!!!"

    cd $BUILD_DIR

    if [ ! -d $ARTIFACTS_DIR ]; then
        mkdir -p $ARTIFACTS_DIR
    fi

    cp rsa_verify_sha1_pkcs1v15_js/rsa_verify_sha1_pkcs1v15.wasm $ARTIFACTS_DIR
    cp circuit_final.zkey $ARTIFACTS_DIR
    cp verification_key.json $ARTIFACTS_DIR
    echo "Setup finished!"
}

function gen_cert_and_key() {
    cd $BUILD_DIR
    openssl req -newkey rsa:2048 -x509 -nodes -keyout cakey.pem -out cacert.pem -days 3650 -subj "/C=GB/ST=London/L=London/O=Global Security/OU=IT Department/CN=example.com"  
    openssl pkcs12 -export -out keyStore.p12 -inkey cakey.pem -in cacert.pem  -passout pass:password
    openssl x509 -inform PEM -in cacert.pem -outform DER -out certificate.cer   
    npx node-signpdf-gen $BUILD_DIR/signed.pdf $BUILD_DIR/keyStore.p12
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
    *)
        echo "Usage: $0 {install|setup|pdf-setup}"
    ;;
esac

