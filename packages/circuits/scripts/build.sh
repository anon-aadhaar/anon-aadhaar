#!/bin/bash


# default dir
BUILD_DIR="$(pwd)/build"
PTAU="powersOfTau28_hez_final_20.ptau"
PTAU_PATH="$BUILD_DIR/$PTAU"
CONTRACTS_DIR="$(pwd)/../contracts/src"
JS_BUILD_DIR="$BUILD_DIR/aadhaar-verifier_js"
PARTIAL_ZKEYS_DIR="$BUILD_DIR/partial_zkeys"
ARTIFACTS_DIR="$(pwd)/artifacts"
CIRCOM_BIN_DIR="$HOME/.cargo/bin/circom"


# install circom and dependencies
function install_deps() {

    if [ ! -d "$BUILD_DIR" ]; then
        mkdir -p "$BUILD_DIR"
    fi

    echo "Install circom"
    cd "$BUILD_DIR"
    if [ ! -f "$CIRCOM_BIN_DIR" ]; then
        git clone https://github.com/iden3/circom.git
        cd circom
        cargo build --release
        cargo install --path circom
        echo "Installed circom!"
    else 
        echo "Circom already install... Skip this action!"
    fi 

    echo "Download power of tau...."
    cd "$BUILD_DIR"
    if [ ! -f "$PTAU_PATH" ]; then
        wget https://hermez.s3-eu-west-1.amazonaws.com/$PTAU
        echo "Finished download!"
    else 
        echo "Powers of tau file already downloaded... Skip download action!"
    fi 

    echo "Finished install deps!!!!"
}

function build_circuit() {
    circom ./src/aadhaar-verifier.circom  --r1cs --wasm --c -o "$BUILD_DIR" -l ./node_modules -l ../../node_modules
}

# trusted setup for development
# DON'T USE IT IN PRODUCTION
function dev_trusted_setup() {
    echo "Starting setup...!"

    HASH=$(pwd)/scripts/utils.sh

    if [ -f "$BUILD_DIR"/hash.txt ]; then 
        OLD_HASH=`cat "$BUILD_DIR"/hash.txt`
        echo $OLD_HASH
    else 
        OLD_HASH=""
    fi

    if [ ! -d "$PARTIAL_ZKEYS_DIR" ]; then
        mkdir -p "$PARTIAL_ZKEYS_DIR"
    fi

    if [ "$HASH" != "$OLD_HASH" ]; then 
    echo "TRUSTED SETUP FOR DEVELOPMENT - PLEASE, DON'T USE IT IN PRODUCTION !!!"

    NODE_OPTIONS=--max-old-space-size=8192 \
	node ./node_modules/.bin/snarkjs groth16 setup "$BUILD_DIR"/aadhaar-verifier.r1cs "$PTAU_PATH" "$PARTIAL_ZKEYS_DIR"/circuit_0000.zkey

    echo "test random" | NODE_OPTIONS='--max-old-space-size=8192' \
	node ./node_modules/.bin/snarkjs zkey contribute "$PARTIAL_ZKEYS_DIR"/circuit_0000.zkey "$PARTIAL_ZKEYS_DIR"/circuit_final.zkey --name="1st Contributor Name" -v 
    NODE_OPTIONS='--max-old-space-size=8192' ./node_modules/.bin/snarkjs zkey export verificationkey "$PARTIAL_ZKEYS_DIR"/circuit_final.zkey "$BUILD_DIR"/vkey.json

    fi
        if [ ! -d "$ARTIFACTS_DIR" ]; then
        mkdir -p "$ARTIFACTS_DIR"
    fi

    cp "$JS_BUILD_DIR"/aadhaar-verifier.wasm "$ARTIFACTS_DIR"
    cp "$PARTIAL_ZKEYS_DIR"/circuit_final.zkey "$ARTIFACTS_DIR"
    cp "$BUILD_DIR"/vkey.json "$ARTIFACTS_DIR"

    echo $HASH > "$BUILD_DIR"/hash.txt
    
    echo "Setup finished!"
}


function setup_contract() {
    cd "$ROOT"
    echo "Building contracts...!"
    mkdir -p "$BUILD_DIR"/contracts
    npx snarkjs zkey export solidityverifier "$PARTIAL_ZKEYS_DIR"/circuit_final.zkey "$BUILD_DIR"/contracts/Verifier.sol
    # Update the contract name in the Solidity verifier
    sed -i '' -e "s/contract Groth16Verifier/contract Verifier/g" "$BUILD_DIR"/contracts/Verifier.sol
    cp "$BUILD_DIR"/contracts/Verifier.sol "$CONTRACTS_DIR"
    echo "Contracts generated!"
}

function generate_witness() {
    echo "Gen witness..."
    QR_DATA=$QR_DATA npx ts-node ./scripts/generateInput.ts
    node "$JS_BUILD_DIR"/generate_witness.js "$JS_BUILD_DIR"/aadhaar-verifier.wasm  "$BUILD_DIR"/input.json "$BUILD_DIR"/witness.wtns
    echo "Done!"
}

function generate_proof() {
    echo "Building proof...!"
    mkdir -p "$BUILD_DIR"/proofs

    NODE_OPTIONS='--max-old-space-size=8192' ./node_modules/.bin/snarkjs groth16 prove "$PARTIAL_ZKEYS_DIR"/circuit_final.zkey "$BUILD_DIR"/witness.wtns "$BUILD_DIR"/proofs/proof.json "$BUILD_DIR"/proofs/public.json
    echo "Generated proof...!"

}

function verify_proof() {
    NODE_OPTIONS='--max-old-space-size=8192' ./node_modules/.bin/snarkjs groth16 verify "$BUILD_DIR"/vkey.json "$BUILD_DIR"/proofs/public.json "$BUILD_DIR"/proofs/proof.json
    echo "Verify proof...!"
}

case "$1" in
    install)
        install_deps
    ;;
    build)
        build_circuit
    ;;
    setup)
        dev_trusted_setup
    ;;
    gen-proof) 
        generate_proof
    ;;
    gen-contracts) 
        setup_contract
    ;;
    gen-witness) 
        generate_witness
    ;;
    verify-proof)
        verify_proof
    ;;
    *)
        echo "Usage: $0 {install|build|setup|gen-proof|gen-contracts|gen-witness|verify-proof}"
    ;;
esac
