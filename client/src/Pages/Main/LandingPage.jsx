import React from 'react';
import { Link } from 'react-router-dom';
import FeaturesImg from '../../assets/Features.png';
import ChatImg from '../../assets/chat.png';
import RightArrow from '../../assets/icons/arrow-right.svg';
import HowItWorks from '../../assets/how-it-works.png';
import { getLocalStorageWithExpiry } from '../../helpers/auth/authFn';

const LandingPage = () => {
    const token = getLocalStorageWithExpiry('auth');

    return (
        <>
            <div className="container">
                {/* Hero Section */}
                <div className="row d-flex heroSct justify-content-center align-items-center">
                    <div className="col-md-6">
                        <h1 className="display-1">Welcome to Node Natter</h1>
                        <p className="lead">
                        Node Natter is a real-time chat application that empowers users to create chat rooms and engage in dynamic conversations.
                        </p>
                        {token ? (
                            <Link to='/rooms' className="btn btn-primary btn-lg">Go to Chat Rooms</Link>
                        ) : (
                            <Link to='/login' className="btn btn-primary btn-lg">Login</Link>
                        )}
                    </div>

                    <div className="col-md-6 imageCnt">
                        <img src={ChatImg} alt="chat app" className="img-fluid landing-page-image" />
                    </div>
                </div>

                <hr />

                {/* Key Features Section */}
                <div className="row d-flex justify-content-center align-items-center">
                    <div className="col-md-12 text-center">
                        <h2 className="display-2">Key Features</h2>
                    </div>

                    <div className="col-md-6">
                        <img src={FeaturesImg} alt="chat app" className="img-fluid landing-page-image" />
                    </div>

                    <div className="col-md-6 text-start keyFeaturesCnt">
                        <h3 className="display-3 mb-3">Explore Chat Rooms</h3>
                        <p className="lead mb-3">
                            <img src={RightArrow} className='img-fluid' /> &nbsp;Create personalized chat rooms and extend invitations to other users for collaborative conversations.
                        </p>
                        <p className='lead mb-3'>
                            <img src={RightArrow} className='img-fluid' /> &nbsp;Stay informed in real-time about participants joining and leaving your chat room.
                        </p>
                        <p className='lead mb-3'>
                            <img src={RightArrow} className='img-fluid' /> &nbsp; Experience the immediacy of knowing who is actively typing at any given moment.
                        </p>
                        <p className='lead mb-3'>
                            <img src={RightArrow} className='img-fluid' /> &nbsp; Engage in seamless, real-time conversations with other users within the chat room.
                        </p>
                    </div>
                </div>

                <hr />

                {/* How It Works Section */}
                <div className="row  d-flex justify-content-center align-items-center">
                    <div className="col-md-12 text-center">
                        <h2 className="display-2">How It Works</h2>
                    </div>

                    <div className="col-md-6 text-start keyFeaturesCnt">
                        <h3 className="display-3 my-3">Create a Chat Room</h3>
                        <p className="lead mb-3">
                            <img src={RightArrow} className='img-fluid' /> &nbsp;Create a personalized chat room with a unique name and description.
                        </p>
                        <p className='lead mb-3'>
                            <img src={RightArrow} className='img-fluid' /> &nbsp;Invite other users to join your chat room by sharing the unique room ID.
                        </p>
                        <p className='lead mb-3'>
                            <img src={RightArrow} className='img-fluid' /> &nbsp;Start chatting in real-time with other users within the chat room.
                        </p>
                    </div>

                    <div className="col-md-6">
                        <img src={HowItWorks} alt="chat app" className="img-fluid landing-page-image" />
                    </div>
                </div>

                <hr />
            </div>

            {/* Footer Section */}
            <footer className="footer mt-auto py-3 bg-light text-center">
                <div className="container">
                   @ Created by <a href="https://github.com/Slacky300" style={{textDecoration: "none"}} target="_blank" rel="noopener noreferrer">Slacky300</a> <img src="https://avatars.githubusercontent.com/u/98531038?s=400&u=26bc7ff714b2e2147076d484ea2bb066453702c7&v=4" alt="Slacky300's Avatar" style={{ width: '30px', borderRadius: '50%' }} />
                </div>
            </footer>
        </>
    );
}

export default LandingPage;
