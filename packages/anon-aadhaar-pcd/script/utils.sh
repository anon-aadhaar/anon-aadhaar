#!/bin/bash


RSA_DIR=$(pwd)/circuits/RSA
NULLIFIER_DIR=$(pwd)/circuits/Nullifier

ALL_HASH="";
for file in $(ls $RSA_DIR) 
do 
    ALL_HASH+="$(sha256sum $RSA_DIR/$file)"
done 

for file in $(ls $NULLIFIER_DIR) 
do 
    ALL_HASH+="$(sha256sum $NULLIFIER_DIR/$file)"
done 


FINAL_HASH=$(echo $ALL_HASH | sha256sum | cut -d" " -f 1)

echo $FINAL_HASH