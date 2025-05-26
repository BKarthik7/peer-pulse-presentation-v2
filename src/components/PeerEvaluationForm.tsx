
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface PeerEvaluationFormProps {
  teamName: string;
  evaluatorUSN: string;
  onSubmit: (evaluationData: any) => void;
}

interface CriterionRating {
  id: string;
  label: string;
  description: string;
  rating: number[];
}

const PeerEvaluationForm: React.FC<PeerEvaluationFormProps> = ({ 
  teamName, 
  evaluatorUSN, 
  onSubmit 
}) => {
  const [ratings, setRatings] = useState<CriterionRating[]>([
    {
      id: 'content',
      label: 'Content Quality',
      description: 'Technical accuracy and depth of content',
      rating: [5]
    },
    {
      id: 'presentation',
      label: 'Presentation Skills',
      description: 'Clarity, confidence, and delivery',
      rating: [5]
    },
    {
      id: 'innovation',
      label: 'Innovation & Creativity',
      description: 'Original ideas and creative approach',
      rating: [5]
    },
    {
      id: 'teamwork',
      label: 'Team Coordination',
      description: 'Collaboration and team dynamics',
      rating: [5]
    }
  ]);

  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateRating = (id: string, value: number[]) => {
    setRatings(prev => 
      prev.map(rating => 
        rating.id === id ? { ...rating, rating: value } : rating
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const evaluationData = {
      teamName,
      evaluatorUSN,
      ratings: ratings.map(rating => ({
        criterion: rating.id,
        label: rating.label,
        score: rating.rating[0]
      })),
      feedback,
      submittedAt: new Date().toISOString()
    };

    // Simulate submission delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSubmit(evaluationData);
    setIsSubmitting(false);
  };

  const getOverallScore = () => {
    const total = ratings.reduce((sum, rating) => sum + rating.rating[0], 0);
    return (total / ratings.length).toFixed(1);
  };

  const getRatingColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Evaluate {teamName}</h2>
        <Badge variant="outline" className="mb-4">
          Evaluator: {evaluatorUSN}
        </Badge>
        <div className="text-lg">
          Overall Score: <span className={`font-bold ${getRatingColor(parseFloat(getOverallScore()))}`}>
            {getOverallScore()}/10
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {ratings.map((criterion) => (
          <Card key={criterion.id}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">{criterion.label}</h3>
                  <p className="text-sm text-gray-600">{criterion.description}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Poor</span>
                    <Badge variant="secondary">
                      {criterion.rating[0]}/10
                    </Badge>
                    <span>Excellent</span>
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
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Additional Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Provide constructive feedback, suggestions for improvement, or highlight strengths..."
            rows={5}
            className="w-full"
          />
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        className="w-full bg-green-600 hover:bg-green-700" 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
      </Button>
    </form>
  );
};

export default PeerEvaluationForm;
