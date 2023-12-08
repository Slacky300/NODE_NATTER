const ChatBubble = ({ isSent, message, sender, system }) => {

    return (
        <>
            {system ? (<div className={`mb-2 d-flex justify-content-center`}>
                <div className={`chat-bubble`}>
                   <b>System: {message}</b> 
                </div>
            </div>) : (<div className={`mb-2 d-flex ${isSent ? 'justify-content-end' : 'justify-content-start'}`}>
                <div className={`chat-bubble ${isSent ? 'me-2' : 'me-auto'}`}>
                    {isSent ? `You:` : `${sender}:`} <br /> {message}
                </div>
            </div>)}





        </>
    )
}


export default ChatBubble;