import Provider from "./index";

async function main() {
    const provider = new Provider();
    console.log('test get provider info');
    const info = await provider.getProviderInfo();
    console.dir(info);
    console.log('test with option');
    const result = await provider.parseWithOption({
        listEpsUrl: "https://otakudesu.org/wp-admin/admin-ajax.php?action=epslist&id=95998"
    });
    console.dir(result);
    console.log('test without option');
    const result2 = await provider.parseAndGetOptions([
        "The God of High School"
    ]);
    console.dir(result2);
}

main().catch(err=>console.error(err));
