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