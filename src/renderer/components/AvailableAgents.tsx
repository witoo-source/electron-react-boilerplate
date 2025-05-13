import axios from 'axios'
import { JSX, use, useState } from 'react'
import { useToken } from './TokenContext'

interface Props {
    agentName: string,
    agentID: string
    avatar: string
    agentBackground: string[]
}

interface IUser {
    country: string;
    sub: string;
    email_verified: boolean;
    player_plocale?: unknown | null;
    country_at: number | null;
    pw: {
        cng_at: number;
        reset: boolean;
        must_reset: boolean;
    };
    phone_number_verified: boolean;
    account_verified: boolean;
    ppid?: unknown | null;
    federated_identity_providers: string[];
    player_locale: string | null;
    acct: {
        type: number;
        state: string;
        adm: boolean;
        game_name: string;
        tag_line: string;
        created_at: number;
    };
    age: number;
    jti: string;
    affinity: {
        [x: string]: string;
    };
};

interface IPreGame {
    Subject: string;
    MatchID: string;
    Version: number;
}


export default function Agent(props: Props): JSX.Element {
    const [matchID, setMatchID] = useState<string>('')
    const [PUUID, setPUUID] = useState<string>('')
    const [UserInfo, setUserInfo] = useState<IUser>()

    const {
        token,
        setToken,
        entitlements,
        setEntitlements
    } = useToken()

    function instalock(): void {
        try {
            window.electron.ipcRenderer.getPUUID(token)
                .then((puuid) => {
                    setPUUID(puuid)
                    alert(puuid)
                })
            window.electron.ipcRenderer.getMatchID(PUUID, props.agentID, token, entitlements)
                .then((matchid) => {
                    setMatchID(matchid)
                    alert(matchid)
                })
            window.electron.ipcRenderer.instalock(matchID, props.agentID, token, entitlements)
                .then((val) => {
                    alert(val)
                })
        } catch(e) {
            alert(e)
        }
    }

    return (
        <div id='agentView' onClick={instalock}>
            <img id='avatar' src={props.avatar} />
            <span id='agentName'>{props.agentName}</span>
        </div>
    )
}