
import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface CSVUploaderProps {
  onUpload: (data: string[][]) => void;
  acceptedTypes?: string;
  description?: string;
}

const CSVUploader: React.FC<CSVUploaderProps> = ({ 
  onUpload, 
  acceptedTypes = '.csv', 
  description = 'Upload a CSV file' 
}) => {
  const { toast } = useToast();

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n');
    const result: string[][] = [];
    
    for (let line of lines) {
      if (line.trim()) {
        // Simple CSV parsing - split by comma and trim whitespace
        const values = line.split(',').map(value => value.trim().replace(/"/g, ''));
        result.push(values);
      }
    }
    
    return result;
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);
        
        if (data.length === 0) {
          toast({
            title: "Empty file",
            description: "The CSV file appears to be empty.",
            variant: "destructive",
          });
          return;
        }

        onUpload(data);
        toast({
          title: "File uploaded successfully",
          description: `Processed ${data.length} rows.`,
        });
      } catch (error) {
        toast({
          title: "Error parsing file",
          description: "Please check your CSV format.",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);
    // Clear the input
    event.target.value = '';
  }, [onUpload, toast]);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="csv-upload" className="block text-sm font-medium mb-2">
          {description}
        </Label>
        <Input
          id="csv-upload"
          type="file"
          accept={acceptedTypes}
          onChange={handleFileUpload}
          className="cursor-pointer"
        />
      </div>
      
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">CSV Format Guidelines:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>For USNs: One USN per row or comma-separated</li>
              <li>For Teams: team_name, usn1, usn2, usn3, ...</li>
              <li>No headers required</li>
              <li>UTF-8 encoding recommended</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CSVUploader;
