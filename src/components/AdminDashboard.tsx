import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Timer from '@/components/Timer';
import EvaluationForm from '@/components/EvaluationForm';
import CSVUploader from '@/components/CSVUploader';
import { io, Socket } from 'socket.io-client';

interface Team {
  name: string;
  members: string[];
}

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [usnList, setUsnList] = useState<string[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [presentationStatus, setPresentationStatus] = useState<'idle' | 'starting' | 'active' | 'evaluation'>('idle');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [teamEvaluations, setTeamEvaluations] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Connect to Socket.IO server
    const socketInstance = io('http://localhost:8080', {
      withCredentials: true
    });

    socketInstance.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    socketInstance.on('teamEvaluations', (data) => {
      if (data.team === selectedTeam) {
        setTeamEvaluations(data.evaluations);
      }
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [selectedTeam]);

  const handleUSNUpload = (data: string[][]) => {
    const usns = data.flat().filter(usn => usn && usn.trim());
    setUsnList(usns);
    toast({
      title: "USN List Uploaded",
      description: `${usns.length} USNs uploaded successfully.`,
    });
  };

  const handleTeamUpload = (data: string[][]) => {
    const teamData: Team[] = data.map(row => ({
      name: row[0] || '',
      members: row.slice(1).filter(member => member && member.trim())
    })).filter(team => team.name);

    setTeams(teamData);
    toast({
      title: "Teams Uploaded",
      description: `${teamData.length} teams uploaded successfully.`,
    });
  };

  const startPresentation = () => {
    if (!selectedTeam) {
      toast({
        title: "No team selected",
        description: "Please select a team first.",
        variant: "destructive",
      });
      return;
    }

    setPresentationStatus('starting');
    socket?.emit('presentationStarting', { team: selectedTeam });
    
    setTimeout(() => {
      setPresentationStatus('active');
      socket?.emit('presentationStarted', { team: selectedTeam });
      toast({
        title: "Presentation Started",
        description: `${selectedTeam} presentation is now active.`,
      });
    }, 3000);
  };

  const endPresentation = () => {
    setPresentationStatus('evaluation');
    socket?.emit('presentationEnded', { team: selectedTeam });
    toast({
      title: "Presentation Ended",
      description: "Moving to evaluation phase.",
    });
  };

  const resetPresentation = () => {
    setPresentationStatus('idle');
    setSelectedTeam('');
    socket?.emit('presentationReset');
  };

  const calculateAverageScore = (evaluations: any[]) => {
    if (evaluations.length === 0) return 0;
    
    const totalScore = evaluations.reduce((sum, evaluation) => {
      const criteriaScore = evaluation.ratings.reduce((critSum: number, rating: any) => critSum + rating.score, 0);
      return sum + (criteriaScore / evaluation.ratings.length);
    }, 0);
    
    return (totalScore / evaluations.length).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage presentations and evaluations</p>
          </div>
          <Button onClick={onLogout} variant="outline">
            Logout
          </Button>
        </div>

        <Tabs defaultValue="setup" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="presentation">Presentation</TabsTrigger>
            <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload USN List</CardTitle>
                </CardHeader>
                <CardContent>
                  <CSVUploader 
                    onUpload={handleUSNUpload}
                    acceptedTypes=".csv"
                    description="Upload a CSV file containing USNs"
                    uploadType="participants"
                  />
                  {usnList.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium">Uploaded USNs ({usnList.length}):</p>
                      <div className="flex flex-wrap gap-1 mt-2 max-h-32 overflow-y-auto">
                        {usnList.slice(0, 10).map((usn, index) => (
                          <Badge key={index} variant="secondary">{usn}</Badge>
                        ))}
                        {usnList.length > 10 && (
                          <Badge variant="outline">+{usnList.length - 10} more</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upload Teams</CardTitle>
                </CardHeader>
                <CardContent>
                  <CSVUploader 
                    onUpload={handleTeamUpload}
                    acceptedTypes=".csv"
                    description="Upload teams: team_name, usn1, usn2, ..."
                    uploadType="teams"
                  />
                  {teams.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium">Uploaded Teams ({teams.length}):</p>
                      <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                        {teams.slice(0, 5).map((team, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium">{team.name}</span>: {team.members.join(', ')}
                          </div>
                        ))}
                        {teams.length > 5 && (
                          <p className="text-sm text-gray-500">+{teams.length - 5} more teams</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="presentation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Selection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Select presenting team</Label>
                    <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Choose a team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team, index) => (
                          <SelectItem key={index} value={team.name}>
                            {team.name} ({team.members.length} members)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={startPresentation} 
                      disabled={!selectedTeam || presentationStatus !== 'idle'}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Start Presentation
                    </Button>
                    <Button 
                      onClick={endPresentation} 
                      disabled={presentationStatus !== 'active'}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      End Presentation
                    </Button>
                  </div>

                  <Button 
                    onClick={resetPresentation} 
                    variant="outline" 
                    className="w-full"
                  >
                    Reset
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Presentation Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span>Status:</span>
                      <Badge variant={
                        presentationStatus === 'active' ? 'default' :
                        presentationStatus === 'starting' ? 'secondary' :
                        presentationStatus === 'evaluation' ? 'destructive' :
                        'outline'
                      }>
                        {presentationStatus.toUpperCase()}
                      </Badge>
                    </div>
                    
                    {selectedTeam && (
                      <div>
                        <span className="font-medium">Current Team:</span> {selectedTeam}
                      </div>
                    )}

                    {(presentationStatus === 'active' || presentationStatus === 'starting') && (
                      <Timer 
                        isActive={presentationStatus === 'active'}
                        onTimeUpdate={(time) => {
                          socket?.emit('timeSync', { time, team: selectedTeam });
                        }}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="evaluation">
            {presentationStatus === 'evaluation' && selectedTeam && (
              <EvaluationForm 
                teamName={selectedTeam}
                onSubmit={(evaluationData) => {
                  console.log('Evaluation submitted:', evaluationData);
                  toast({
                    title: "Evaluation Sent",
                    description: "Evaluation form has been sent to peers.",
                  });
                  socket?.emit('evaluationForm', { team: selectedTeam, form: evaluationData });
                }}
              />
            )}
            {presentationStatus !== 'evaluation' && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">End a presentation to start evaluation</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle>Evaluation Results</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTeam ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{selectedTeam}</h3>
                      <Badge variant="secondary">
                        Average Score: {calculateAverageScore(teamEvaluations)}/10
                      </Badge>
                    </div>
                    
                    {teamEvaluations.length > 0 ? (
                      <div className="space-y-4">
                        {teamEvaluations.map((evaluation, index) => (
                          <Card key={index} className="p-4">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Evaluator: {evaluation.evaluatorUSN}</span>
                                <span className="text-sm text-gray-500">
                                  {new Date(evaluation.submittedAt).toLocaleString()}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                {evaluation.ratings.map((rating: any, idx: number) => (
                                  <div key={idx} className="space-y-1">
                                    <span className="text-sm font-medium">{rating.label}</span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                          className="bg-blue-600 h-2 rounded-full"
                                          style={{ width: `${(rating.score / 10) * 100}%` }}
                                        />
                                      </div>
                                      <span className="text-sm">{rating.score}/10</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {evaluation.feedback && (
                                <div className="mt-4">
                                  <h4 className="text-sm font-medium mb-1">Feedback:</h4>
                                  <p className="text-sm text-gray-600">{evaluation.feedback}</p>
                                </div>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        No evaluations submitted yet
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Select a team to view evaluation results
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
