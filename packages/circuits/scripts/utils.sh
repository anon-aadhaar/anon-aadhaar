#!/bin/bash


CIRCUIT=./circuits

ALL_HASH="";
for file in $(ls $CIRCUIT) 
do 
    ALL_HASH+="$(sha256sum $CIRCUIT/$file)"
done 


FINAL_HASH=$(echo $ALL_HASH | sha256sum | cut -d" " -f 1)

echo $FINAL_HASH