import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Timer from '@/components/Timer';
import PeerEvaluationForm from '@/components/PeerEvaluationForm';
import { useToast } from '@/hooks/use-toast';
import { io, Socket } from 'socket.io-client';

interface PeerInterfaceProps {
  usn: string;
  onLogout: () => void;
}

const PeerInterface: React.FC<PeerInterfaceProps> = ({ usn, onLogout }) => {
  const [presentationStatus, setPresentationStatus] = useState<'waiting' | 'starting' | 'active' | 'evaluation'>('waiting');
  const [currentTeam, setCurrentTeam] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [evaluationForm, setEvaluationForm] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Connect to Socket.IO server using the current origin
    const socketInstance = io(window.location.origin, {
      withCredentials: true,
      path: '/socket.io'
    });

    socketInstance.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    setSocket(socketInstance);

    // Set up socket listeners
    socketInstance.on('presentationStarting', (data: { team: string }) => {
      setCurrentTeam(data.team);
      setPresentationStatus('starting');
      toast({
        title: "Presentation Starting Soon",
        description: `${data.team} will present shortly.`,
      });
    });

    socketInstance.on('presentationStarted', (data: { team: string }) => {
      setCurrentTeam(data.team);
      setPresentationStatus('active');
      toast({
        title: "Presentation Started",
        description: `${data.team} is now presenting.`,
      });
    });

    socketInstance.on('presentationEnded', () => {
      setPresentationStatus('evaluation');
      toast({
        title: "Presentation Ended",
        description: "Please wait for the evaluation form.",
      });
    });

    socketInstance.on('timeSync', (data: { time: number }) => {
      setCurrentTime(data.time);
    });

    socketInstance.on('evaluationForm', (data: { team: string, form: any }) => {
      setEvaluationForm(data.form);
      toast({
        title: "Evaluation Form Available",
        description: "Please submit your evaluation.",
      });
    });

    socketInstance.on('presentationReset', () => {
      setPresentationStatus('waiting');
      setCurrentTeam('');
      setCurrentTime(0);
      setEvaluationForm(null);
    });

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [toast]);

  const getStatusMessage = () => {
    switch (presentationStatus) {
      case 'waiting':
        return 'Waiting for presentation to start...';
      case 'starting':
        return `${currentTeam} presentation starting soon...`;
      case 'active':
        return `${currentTeam} is presenting`;
      case 'evaluation':
        return 'Presentation ended - Evaluation time';
      default:
        return 'Waiting...';
    }
  };

  const getStatusColor = () => {
    switch (presentationStatus) {
      case 'waiting':
        return 'outline';
      case 'starting':
        return 'secondary';
      case 'active':
        return 'default';
      case 'evaluation':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Peer Evaluation</h1>
            <p className="text-gray-600">Logged in as: {usn}</p>
          </div>
          <Button onClick={onLogout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="space-y-6">
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Presentation Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge variant={getStatusColor()} className="text-lg px-4 py-2">
                {getStatusMessage()}
              </Badge>
              
              {currentTeam && (
                <div>
                  <p className="text-sm text-gray-600">Current Team:</p>
                  <p className="text-xl font-semibold">{currentTeam}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {(presentationStatus === 'active' || presentationStatus === 'starting') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Presentation Timer</CardTitle>
              </CardHeader>
              <CardContent>
                <Timer 
                  isActive={presentationStatus === 'active'}
                  syncedTime={currentTime}
                  readonly={true}
                />
              </CardContent>
            </Card>
          )}

          {presentationStatus === 'evaluation' && evaluationForm && (
            <Card>
              <CardHeader>
                <CardTitle>Evaluate {currentTeam}</CardTitle>
              </CardHeader>
              <CardContent>
                <PeerEvaluationForm 
                  teamName={currentTeam}
                  evaluatorUSN={usn}
                  onSubmit={(evaluationData) => {
                    console.log('Peer evaluation submitted:', evaluationData);
                    socket?.emit('evaluationSubmitted', {
                      team: currentTeam,
                      evaluator: usn,
                      evaluation: evaluationData
                    });
                    toast({
                      title: "Evaluation Submitted",
                      description: "Thank you for your feedback!",
                    });
                    setEvaluationForm(null);
                  }}
                />
              </CardContent>
            </Card>
          )}

          {presentationStatus === 'waiting' && (
            <Card>
              <CardContent className="text-center py-12">
                <div className="animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-500">Waiting for admin to start a presentation...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PeerInterface;
