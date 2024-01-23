#!/bin/bash


CIRCUIT=$(pwd)/src

ALL_HASH="";
for file in $(find $CIRCUIT -type f) 
do 
    ALL_HASH+="$(sha256sum $file)"
done 


FINAL_HASH=$(echo $ALL_HASH | sha256sum | cut -d" " -f 1)

echo $FINAL_HASH