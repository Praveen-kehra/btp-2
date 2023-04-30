const Permission = () => {
    const clickHandler = async () => {
        const folderHandle = await window.showDirectoryPicker({ writable : true })
        console.log(folderHandle)
        const serialized = JSON.stringify({
            name : folderHandle.name,
            kind: folderHandle.kind,
            isDirectory: true
        })
        window.localStorage.setItem('my-app', serialized)
    }
    return (
        <div className="permission">
            <button onClick={clickHandler}>Grant Permission</button>
        </div>
    )
}

export default Permission;