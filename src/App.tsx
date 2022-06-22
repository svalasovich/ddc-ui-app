import React, {useCallback, useEffect, useState} from 'react';
import logo from './logo.svg';
import './App.css';
import {web3Accounts, web3Enable, web3FromAddress} from "@polkadot/extension-dapp";
import {InjectedAccountWithMeta} from "@polkadot/extension-inject/types";
import {uploadMain} from "./UploadMain";
import {extensionUpload} from "./ExtensionUpload";
import {DEVNET, SmartContract} from "@cere-ddc-sdk/smart-contract";

async function bucket(acc: InjectedAccountWithMeta) {
    const sc = await SmartContract.buildAndConnect(acc, DEVNET);

    const {bucketId} = await sc.bucketCreate(10n, '{"replication": 3}', 0n);
    console.log(bucketId);

    const statusBucket = await sc.bucketGet(bucketId);
    console.log(statusBucket);
}

async function mainBucket() {
    const mnemonic = "grass smooth rain offer matter senior crucial slim clip news town opera";
    const sc = await SmartContract.buildAndConnect(mnemonic, DEVNET);

    const {bucketId} = await sc.bucketCreate(10n, '{"replication": 3}', 0n);
    console.log(bucketId);

    const statusBucket = await sc.bucketGet(bucketId);
    console.log(statusBucket);
}

function App() {
    const [accounts, setAccounts] = useState(new Array<InjectedAccountWithMeta>());
    let loadAccounts = useCallback(async () => {
        await web3Enable("React App");

        const acc = new Array<InjectedAccountWithMeta>();
        for (const account of await web3Accounts()) {
            console.log(account)
            let injector = await web3FromAddress(account.address);
            let signRaw = injector.signer.signRaw;

            acc.push(account);
        }

        setAccounts(acc)
    }, [])

    useEffect(() => {
        loadAccounts();
    }, [loadAccounts]);

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo"/>
                {accounts.map((e) => (
                    <button key={e.address} onClick={() => extensionUpload(e)} className="App-button">
                        Upload encrypted to DDC For '{e.meta.name}'
                    </button>
                ))}
                <button onClick={() => uploadMain()} className="App-button">Upload encrypted to DDC For MAIN</button>
            </header>

            <div className="App-header">
                {accounts.map((e) => (
                    <button key={e.address} onClick={() => bucket(e)} className="App-button">
                        Create and read bucket for '{e.meta.name}'
                    </button>
                ))}
                <button onClick={() => mainBucket()} className="App-button">Create and read bucket for 'MAIN'</button>
            </div>
        </div>
    );
}

export default App;
