const deleteAnnounce = (data) => {
    socket.emit("deleteAnnounce", {data}) //sunucuya mesaj gönderiyorum
    // location.href = "/joinAnnounce"
    console.log(data)
    window.location.reload() //Sunucudan silindiktensonra sayfayı yenilemek için
}   

const routeAnnounce = () => {
    location.href = "/announce"
}

