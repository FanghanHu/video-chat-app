// @ts-nocheck
const socket = io();
const peerConnection = new RTCPeerConnection();

//display my video steam on the screen.
navigator.getUserMedia(
    {
        video: true,
        audio: true
    },
    stream => {
        const myVideo = document.getElementById("my-video");
        myVideo.srcObject = stream;

        //add my video track on the peer connection to share later.
        stream.getTracks().forEach(track => {
            peerConnection.addTrack(track, stream);
        });
    },
    err => {
        console.error(err.message);
    }
)

//send my peer to peer connection information to the server
async function sendOffer() {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
    console.log("connection offered broadcasted", {offer});

    socket.emit("offer", {offer: offer});
}

//When I receive a connection request from the server
socket.on("connection-requested", async data => {
    console.log("connection request received", data);
    await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.offer)
    );

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

    socket.emit("answer", {answer: answer});
})

//when I get an answer for a offer I sent out previously
socket.on("connection-accepted", async data => {
    console.log("connection accepted by remote", data);
    await peerConnection.setRemoteDescription (
        new RTCSessionDescription(data.answer)
    );
})

//When stun server give me an ice candidate
peerConnection.addEventListener("icecandidate", e => {
    if(e.candidate) {
        console.log("Ice candidate broadcasted:", e.candidate);
        //send my ice candidate to the server
        socket.emit("new-ice-candidate", {iceCandidate: e.candidate});
    }
})

//when I get an ice candidate from the server
socket.on("ice-candidate-received", async data => {
    if(data.iceCandidate) {
        console.log("ice candidate received:", data.iceCandidate);
        //add that candidate to my connection, and let it connect.
        await peerConnection.addIceCandidate(data.iceCandidate);
    }
})

//when remote video stream show up in my connection.
peerConnection.addEventListener("track", e => {
    console.log('ontrack', e);
    const theirVideo = document.getElementById("their-video");
    //show it on one of my video.
    theirVideo.srcObject = e.streams[0];
})