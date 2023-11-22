#!/bin/bash


RSA_DIR=$(pwd)/circuits/RSA

ALL_HASH="";
for file in $(ls $RSA_DIR) 
do 
    ALL_HASH+="$(sha256sum $RSA_DIR/$file)"
done 


FINAL_HASH=$(echo $ALL_HASH | sha256sum | cut -d" " -f 1)

echo $FINAL_HASH