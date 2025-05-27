import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminDashboard from '@/components/AdminDashboard';
import PeerInterface from '@/components/PeerInterface';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [userType, setUserType] = useState<'admin' | 'peer' | null>(null);
  const [currentUser, setCurrentUser] = useState<string>('');
  const { toast } = useToast();

  const handleAdminLogin = (username: string, password: string) => {
    if (username === 'admin' && password === 'admin123') {
      setUserType('admin');
      setCurrentUser('admin');
      toast({
        title: "Welcome Admin!",
        description: "You have successfully logged in.",
      });
      return true;
    } else {
      toast({
        title: "Invalid credentials",
        description: "Please check your username and password.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handlePeerLogin = (usn: string) => {
    if (usn.trim()) {
      setUserType('peer');
      setCurrentUser(usn);
      toast({
        title: "Welcome!",
        description: `Logged in as ${usn}`,
      });
      return true;
    } else {
      toast({
        title: "Invalid USN",
        description: "Please enter a valid USN.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleLogout = () => {
    setUserType(null);
    setCurrentUser('');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  if (userType === 'admin') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (userType === 'peer') {
    return <PeerInterface usn={currentUser} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            PeerPulse
          </h1>
          <p className="text-gray-600">Presentation Evaluation Platform</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-gray-800">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="admin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="admin" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  Admin
                </TabsTrigger>
                <TabsTrigger value="peer" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                  Peer
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="admin" className="space-y-4">
                <AdminLoginForm onLogin={handleAdminLogin} />
              </TabsContent>
              
              <TabsContent value="peer" className="space-y-4">
                <PeerLoginForm onLogin={handlePeerLogin} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AdminLoginForm = ({ onLogin }: { onLogin: (username: string, password: string) => boolean }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          className="mt-1"
        />
      </div>
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
        Sign In as Admin
      </Button>
    </form>
  );
};

const PeerLoginForm = ({ onLogin }: { onLogin: (usn: string) => boolean }) => {
  const [usn, setUsn] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(usn);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="usn">USN (University Seat Number)</Label>
        <Input
          id="usn"
          type="text"
          value={usn}
          onChange={(e) => setUsn(e.target.value)}
          placeholder="Enter your USN"
          className="mt-1"
        />
      </div>
      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
        Sign In as Peer
      </Button>
    </form>
  );
};

export default Index;
