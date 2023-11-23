import express from 'express';
import fetch from 'node-fetch';
import forge from 'node-forge';

const app = express();
const PORT = 3000;

const publicKeyString = `"-----BEGIN RSA PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAzxI41gpw32cDV2ZeL/VG\nxJ9PK0mJ+nuVR+dlRmxzdmd4gAIcZoaR9ri4aMzPj9muPAQAL/5QAC8gK1fo3YvD\nSq5XiBOExA4IHJhi2wozlQA1xnKDaLrbsohQ/gGtgGutq8bxY+Z1UMR4nFKTpdJy\ndflT0M87l0LK9o98H4nFlnEV8LCJ/KKPZ/6VDCNQhaGjvbzRpPAU0oksvTwKLceO\nEROE5I+L8MmcRzPtQcij+r9XQXmjdC+WU7U0dPKOQ//kY67E/wXkblQ2tZKfdyIX\nz4TSWZQ2J09fNyJMyUsDEdkCVQSmSW+6mEza2cnUmM8Khyl4aOtlElHJgVJu0IM9\nhyaUI/Lb5EHYv2vLpDYWE6dh7+aCPiWFeiiQudyNzFeeTvXTz6zzzNWO5Phvrkja\no62EjY+IuuSriZ8plKEhFtQpqgeK8py66dFLaZL5u1lMm2aO/Pdf1haktDnXWuit\nRKmhYbTo27dnZ2alhTP5rFT3j3EYDwxiwNSPwr+ol/AEe5zIg/Pj/JwPDWlcetoU\nHAmvF/rreLESDexki+Y3Qr3yUGBbh3Ew1M1jo3Apx3/Ovs1dn7t/a0Lx5p5yfFrU\nr+8gOmd4Ghp2lv6NuQpZCG0Ag7fDHfkkmXilzRaN2ZC9ELO32TE8a3dkUJgd0S+y\nk13LWaWBl497uboyq1p8ob0CAwEAAQ==\n-----END RSA PUBLIC KEY-----\n`

const hexEncodedEntitySecret = "c7dbb0430407a2f106c78951e2bedf56010c55b7e8ed186ce7782ab5dee03393";

function encryptEntitySecret() {
    const entitySecret = forge.util.hexToBytes(hexEncodedEntitySecret);
    if (entitySecret.length !== 32) {
        throw new Error("Invalid entity secret");
    }

    const publicKey = forge.pki.publicKeyFromPem(publicKeyString);
    const encryptedData = publicKey.encrypt(entitySecret, "RSA-OAEP", {
        md: forge.md.sha256.create(),
        mgf1: {
            md: forge.md.sha256.create()
        }
    });

    return forge.util.encode64(encryptedData);
}

app.get('/encrypt-and-send', async (req, res) => {
    try {
        const encryptedSecret = encryptEntitySecret();

        const url = 'https://api.circle.com/v1/w3s/developer/walletSets';
        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                authorization: 'Bearer TEST_API_KEY:32226c254826ab1d3513cecf3a3f0ab1:2c195db3c2a66befbafc4c566f9b687e'
            },
            body: JSON.stringify({
                idempotencyKey: '8f459a01-fa23-479d-8647-6fe05526c0df',
                entitySecretCiphertext: encryptedSecret
            })
        };

        const response = await fetch(url, options);
        const jsonResponse = await response.json();

        // const walletSetId = jsonResponse.data.walletSet.id;

        const walletUrl = 'https://api.circle.com/v1/w3s/developer/wallets';
        const walletOptions = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                authorization: 'Bearer TEST_API_KEY:32226c254826ab1d3513cecf3a3f0ab1:2c195db3c2a66befbafc4c566f9b687e' // Replace with your actual API key
            },
            body: JSON.stringify({
                idempotencyKey: '0189bc61-7fe4-70f3-8a1b-0d14426397cb',
                accountType: 'SCA',
                blockchains: ['MATIC-MUMBAI'],
                count: 2,
                entitySecretCiphertext: encryptedSecret,
                walletSetId: '018be839-6ec3-7c27-beff-a52db8b8a193'
            })
        };

        const walletResponse = await fetch(walletUrl, walletOptions);
        const walletJsonResponse = await walletResponse.json();
        const lastWalletIndex = walletJsonResponse.data.wallets.length - 1;
        const lastWalletId = walletJsonResponse.data.wallets[lastWalletIndex].address;

        res.send(lastWalletId);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
