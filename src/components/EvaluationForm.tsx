
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';

interface EvaluationFormProps {
  teamName: string;
  onSubmit: (formData: any) => void;
}

interface EvaluationCriteria {
  id: string;
  label: string;
  description: string;
  rating: number[];
}

const EvaluationForm: React.FC<EvaluationFormProps> = ({ teamName, onSubmit }) => {
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>([
    {
      id: 'content',
      label: 'Content Quality',
      description: 'Technical accuracy and depth of content',
      rating: [7]
    },
    {
      id: 'presentation',
      label: 'Presentation Skills',
      description: 'Clarity, confidence, and delivery',
      rating: [7]
    },
    {
      id: 'innovation',
      label: 'Innovation & Creativity',
      description: 'Original ideas and creative approach',
      rating: [7]
    },
    {
      id: 'teamwork',
      label: 'Team Coordination',
      description: 'Collaboration and team dynamics',
      rating: [7]
    }
  ]);

  const [comments, setComments] = useState('');
  const [timeLimit, setTimeLimit] = useState('15');

  const updateRating = (id: string, value: number[]) => {
    setCriteria(prev => 
      prev.map(criterion => 
        criterion.id === id ? { ...criterion, rating: value } : criterion
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      team: teamName,
      criteria: criteria.map(criterion => ({
        id: criterion.id,
        label: criterion.label,
        rating: criterion.rating[0]
      })),
      comments,
      timeLimit: parseInt(timeLimit),
      createdAt: new Date().toISOString()
    };

    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Evaluation Form for {teamName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="timeLimit">Evaluation Time Limit (minutes)</Label>
            <Input
              id="timeLimit"
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              min="5"
              max="30"
              className="mt-1"
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Evaluation Criteria</h3>
            {criteria.map((criterion) => (
              <Card key={criterion.id} className="p-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">{criterion.label}</h4>
                    <p className="text-sm text-gray-600">{criterion.description}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Poor (1)</span>
                      <span className="font-medium">Rating: {criterion.rating[0]}</span>
                      <span>Excellent (10)</span>
                    </div>
                    <Slider
                      value={criterion.rating}
                      onValueChange={(value) => updateRating(criterion.id, value)}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div>
            <Label htmlFor="comments">Additional Instructions for Evaluators</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Any specific points to focus on or additional instructions..."
              className="mt-1"
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            Send Evaluation Form to Peers
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EvaluationForm;
