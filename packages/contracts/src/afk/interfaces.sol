
interface IIssuerVerifier {
    function verifyProof(bytes proof) external returns (uint256[]);
}

struct Issuer {
    string name;
    address verifier;
    uint256 claimExpiry;
}
