const Permission = () => {
    const clickHandler = async () => {
        const folderHandle = await window.showDirectoryPicker({ writable : true })
        console.log(folderHandle)
        const serializedHandle = JSON.stringify(folderHandle)
        console.log(serializedHandle)
        window.localStorage.setItem('my-app', serializedHandle)
    }
    return (
        <div className="permission">
            <button onClick={clickHandler}>Grant Permission</button>
        </div>
    )
}

export default Permission;