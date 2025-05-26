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

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

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
                <p className="text-gray-500">Results will appear here after evaluations are submitted</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
