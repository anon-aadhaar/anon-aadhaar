#!/bin/bash

git submodule update --init --recursive --remote
cd build 

# git clone https://github.com/iden3/circom.git

cd circom 
cargo build --release
cargo install --path circom

cd ..

# wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_20.ptau

cd ..

cd circom-rsa-verify 
yarn

cd circom-ecdsa 
yarn 
cd ..

cd test 

circom circuits/rsa_verify_sha1_pkcs1v15.circom  --r1cs --wasm -o ../../build

pwd

ls  ../../build

npx snarkjs groth16 setup ../../build/rsa_verify_sha1_pkcs1v15.r1cs ../../build/powersOfTau28_hez_final_20.ptau ../../build/circuit_0000.zkey

echo "test random" | npx snarkjs zkey contribute ../../build/circuit_0000.zkey ../../build/circuit_final.zkey 

npx snarkjs zkey export verificationkey ../../build/circuit_final.zkey ../../build/verification_key.json

cd ../../

cp build/rsa_verify_sha1_pkcs1v15_js/rsa_verify_sha1_pkcs1v15.wasm ./artifacts
cp build/circuit_final.zkey ./artifacts
cp build/verification_key.json ./artifacts

