import { useEffect, useRef, useState } from 'react';
import { FaArrowLeft, FaLock } from 'react-icons/fa';
import { FaGlobe } from "react-icons/fa";
import { useToken } from './TokenContext';
import axios from 'axios';

const ValorantAuthService = () => {
    const webviewRef = useRef(null);
    const [actualUrl, setActualUrl] = useState<string>('https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&nonce=1&scope=account%20openid');
    const [backUrl, setBackUrl] = useState<string>('');
    const [hasWebViewToBeShown, setHasWebViewToBeShown] = useState<boolean>(false);
    const [completed, setCompleted] = useState<boolean>(false)

    const {
        token, 
        setToken,
        entitlements,
        setEntitlements
    } = useToken();

    function back(): void {
        const webview = webviewRef.current;
        if (webview && webview.canGoBack()) {
            webview.goBack();  
        }
    }

    useEffect(() => {
        const webview = webviewRef.current;
        console.log(webview + "hola")

        if (webview) {
            const handleNavigation = (event) => {
                console.log(event.url);
                setBackUrl(actualUrl);
                setActualUrl(event.url);
                
                const hash = event.url.split('#')[1]; 
                if (hash) {
                    const tokenParam = new URLSearchParams(hash);
                    const accessToken = tokenParam.get('access_token');
                    if (accessToken) {
                        setToken(accessToken);
                        window.electron.ipcRenderer.getEntitlements(accessToken)
                            .then((token) => {
                                setEntitlements(token)
                            })
                        setHasWebViewToBeShown(false)
                        setCompleted(true)
                    }
                }

                console.log('Token:', token);
                console.log('URL actual:', event.url);
            };

            webview.addEventListener('did-navigate', handleNavigation);
            webview.addEventListener('did-navigate-in-page', handleNavigation);

            /*return () => {
                webview.removeEventListener('did-navigate', handleNavigation);
                webview.removeEventListener('did-navigate-in-page', handleNavigation);
            };*/
        }
    }, [actualUrl, token]); 

    return (
        (!completed && <div id='preauthservice'>
                {(!hasWebViewToBeShown && !completed) && (
                    <>
                        
                        <div
                            onClick={() => { setHasWebViewToBeShown(true);  /*window.electron.ipcRenderer.clearCookies()*/}}
                            style={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <button id='start'>
                                Sign In with Riot
                            </button>
                        </div>
                    </>
                )}


                <div style={{
                    display: hasWebViewToBeShown ? 'flex' : 'none',
                    flexDirection: 'column',
                    margin: '20px',
                    height: '650px',
                    backdropFilter: 'blur(150px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '80%',
                    borderRadius: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FaArrowLeft width={5} id='backview' onClick={back} />
                        <div id='urlview'>
                            <FaLock width={5} style={{ marginRight: 10 }} />
                            <FaGlobe width={5} style={{ marginRight: 10 }} />
                            <span>
                                {"https://" + actualUrl.split('/')[2]}
                            </span>
                            <span>
                                {token}
                            </span>
                        </div>
                    </div>
                    <webview
                        ref={webviewRef}
                        src="https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&nonce=1&scope=account%20openid"
                        id='webservice'
                    />
                </div>
            
        </div>)
    );
};

export default ValorantAuthService;
