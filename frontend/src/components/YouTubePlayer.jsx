import {
    useEffect,
    useRef,
    useImperativeHandle,
    forwardRef,
} from "react";


const YouTubePlayer = forwardRef(
    (
        {
            videoId,
            onPlayerStateChange,
            canControl,
            onReady
        },
        ref
    ) => {


        const playerRef = useRef(null);

        const containerRef = useRef(null);

        const isReady = useRef(false);





        useImperativeHandle(ref, () => ({


            play() {

                if (
                    playerRef.current &&
                    typeof playerRef.current.playVideo === "function"
                ) {

                    playerRef.current.playVideo();

                }

            },





            pause() {

                if (
                    playerRef.current &&
                    typeof playerRef.current.pauseVideo === "function"
                ) {

                    playerRef.current.pauseVideo();

                }

            },





            seek(time) {

                if (
                    playerRef.current &&
                    typeof playerRef.current.seekTo === "function"
                ) {


                    playerRef.current.seekTo(
                        Number(time),
                        true
                    );


                }

            },





            getCurrentTime() {


                if (
                    playerRef.current &&
                    typeof playerRef.current.getCurrentTime === "function"
                ) {


                    return (
                        playerRef.current.getCurrentTime()
                    );


                }


                return 0;


            }


        }));









       function loadVideo(id = videoId) {


    if (
        !playerRef.current ||
        !isReady.current ||
        !id
    ){
        return;
    }


    console.log(
        "FORCE LOAD VIDEO:",
        id
    );


    playerRef.current.stopVideo();



    setTimeout(()=>{


        playerRef.current.loadVideoById({
            videoId:id,
            startSeconds:0
        });


    },300);


}








        useEffect(() => {



            function createPlayer() {



                if (
                    playerRef.current
                ) {

                    return;

                }





                playerRef.current =
                    new window.YT.Player(
                        containerRef.current,
                        {


                            width: "900",

                            height: "500",



                            playerVars: {


                                controls:
                                    canControl ? 1 : 0,


                                disablekb:
                                    canControl ? 0 : 1,


                                fs:
                                    canControl ? 1 : 0,


                                rel: 0


                            },



                            events: {


                                onReady: (event) => {


                                    console.log(
                                        "YouTube Player Ready"
                                    );



                                    playerRef.current =
                                        event.target;



                                    isReady.current = true;



                                    // load video first
                                    loadVideo(videoId);



                                    if(onReady){

                                        onReady();

                                    }



                                },





                                onStateChange: (event) => {



                                    console.log(
                                        "Player State:",
                                        event.data
                                    );



                                    /*
                                    
                                    1 = PLAYING
                                    2 = PAUSED
                                    3 = BUFFERING (seek)

                                    */


                                    if (

                                        event.data === 1 ||

                                        event.data === 2 ||

                                        event.data === 3

                                    ) {



                                        if(onPlayerStateChange){

                                            onPlayerStateChange(
                                                event
                                            );

                                        }


                                    }


                                },





                                onError: (error)=>{


                                    console.log(
                                        "YouTube Error:",
                                        error.data
                                    );


                                }



                            }



                        }
                    );


            }









            if(
                window.YT &&
                window.YT.Player
            ){


                createPlayer();


            }
            else{


                const script =
                    document.createElement(
                        "script"
                    );


                script.src =
                    "https://www.youtube.com/iframe_api";



                document.body.appendChild(
                    script
                );



                window.onYouTubeIframeAPIReady =
                    createPlayer;



            }









            return ()=>{


                if(
                    playerRef.current
                ){


                    playerRef.current.destroy();


                    playerRef.current = null;


                    isReady.current = false;


                }


                window.onYouTubeIframeAPIReady = null;


            };




        }, []);









        useEffect(()=>{


    if(
        videoId &&
        isReady.current
    ){

        loadVideo(videoId);

    }


},[videoId]);








        return (


            <div
                style={{

                    display:
                        videoId
                            ? "block"
                            : "none",

                    position:
                        "relative",

                    width:
                        "900px",

                    height:
                        "500px"

                }}
            >



                <div
                    ref={containerRef}
                />





                {
                    !canControl && (

                        <div

                            style={{

                                position:
                                    "absolute",

                                top:0,

                                left:0,

                                width:"100%",

                                height:"100%",

                                zIndex:100,

                                background:
                                    "transparent",

                                cursor:
                                    "not-allowed"

                            }}

                        />

                    )
                }




            </div>


        );

    }
);


export default YouTubePlayer;