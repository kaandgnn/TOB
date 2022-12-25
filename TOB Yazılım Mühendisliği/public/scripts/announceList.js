const socket = io()

const joinAnnounce = (data) => {
    socket.emit("joinAnnounce", {data})
    location.href = "/joinAnnounce"
    console.log(data)
} 