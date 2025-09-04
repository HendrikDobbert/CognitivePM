import { NextResponse } from 'next/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { summarize } from '@/ai/flows/summarization-flow';

// Define the structure of a project and task
interface Project {
    id: string;
    name: string;
    [key: string]: any;
}

interface Task {
    id: string;
    text: string;
    completed: boolean;
    projectId: string;
    [key: string]: any;
}

// Define the structure of the API response
interface SummaryResponse {
    projectName: string;
    summary: string;
}

// GET request handler for the API route
export async function GET() {
    try {
        // 1. Fetch all projects
        const projectsCollection = collection(db, 'projects');
        const projectSnapshot = await getDocs(projectsCollection);
        const projects: Project[] = projectSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));

        const summaries: SummaryResponse[] = [];

        // 2. For each project, fetch its tasks and generate a summary
        for (const project of projects) {
            const tasksQuery = query(collection(db, 'tasks'), where('projectId', '==', project.id));
            const tasksSnapshot = await getDocs(tasksQuery);
            const tasks: Task[] = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));

            // We only want to summarize projects that have tasks
            if (tasks.length > 0) {
                const { summary } = await summarize(tasks.map(({ text, completed }) => ({ text, completed })));
                summaries.push({
                    projectName: project.name,
                    summary: summary,
                });
            }
        }

        return NextResponse.json(summaries);
    } catch (error) {
        console.error('Error fetching summaries:', error);
        return NextResponse.json({ error: 'Failed to fetch summaries' }, { status: 500 });
    }
}
