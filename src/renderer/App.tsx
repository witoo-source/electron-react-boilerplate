import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import ValorantAuthService from './components/AuthWebView';
import { useToken } from './components/TokenContext';
import { useState, useEffect } from 'react';
import { IAgent } from './components/Agent.interface';
import axios from 'axios';
import Agent from './components/AvailableAgents';


function MainView() {
  const {
    token, 
    setToken,
    entitlements,
    setEntitlements
  } = useToken();

  const [agents, setAgents] = useState<IAgent[]>([])

  useEffect(() => {
  if (token && entitlements) {
    axios.get('https://valorant-api.com/v1/agents', {
      params: {
        isPlayableCharacter: true
      }
    }).then((data) => {
      setAgents(data.data.data);
    });
  }
}, [token, entitlements]);
  
  return (
    <div style={{ width: "96vw", minHeight: "100vh", margin: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'visible' }}>
      <div id='titleb'></div>
      <div id='shader'></div>
      <ValorantAuthService />
      <div style={{ position: 'absolute', top: '1px', width: '100vw' }}>
        { token && entitlements && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '20px',
              width: '100%',
              height: '100%',
              justifyItems: 'center',
              overflowY: 'auto'
            }}>
              {agents.map((agent) => (
                <Agent
                  key={agent.uuid}
                  agentName={agent.displayName}
                  agentID={agent.uuid}
                  avatar={agent.displayIcon}
                  agentBackground={agent.backgroundGradientColors}
                />
              ))}
            </div>

          ) 
        }
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainView />} />
      </Routes>
    </Router>
  );
}
