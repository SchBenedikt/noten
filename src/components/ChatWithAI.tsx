import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSubjects } from '@/hooks/use-subjects';

const ChatWithAI = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const { subjects } = useSubjects();

  const handleSendQuestion = async () => {
    const grades = subjects.flatMap(subject => subject.grades);
    const gradesString = grades.map(grade => `Subject: ${grade.subject_id}, Grade: ${grade.value}`).join('; ');
    const fullQuestion = `${question} Grades: ${gradesString}`;

    const res = await fetch(`https://google.schaechner.workers.dev/?question=${encodeURIComponent(fullQuestion)}`);
    const data = await res.text();
    setResponse(data);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Chat with AI</h2>
      <div className="space-y-2">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about your grades..."
        />
        <Button onClick={handleSendQuestion}>Send</Button>
      </div>
      {response && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">AI Response:</h3>
          <Textarea value={response} readOnly />
        </div>
      )}
    </div>
  );
};

export default ChatWithAI;
