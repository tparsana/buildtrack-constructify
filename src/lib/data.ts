
export interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: User | null;
  reporter: User;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  attachments: Attachment[];
  projectId: string;
}

export interface Comment {
  id: string;
  text: string;
  author: User;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: User;
  uploadedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed';
  startDate: string;
  endDate: string | null;
  progress: number;
  lead: User;
  team: User[];
  tasks: Task[];
  client: string;
  budget: {
    total: number;
    spent: number;
    currency: string;
  };
  location: string;
}

// Mock users
export const users: User[] = [
  {
    id: 'u1',
    name: 'John Smith',
    avatar: 'https://i.pravatar.cc/150?u=john',
    role: 'Project Manager'
  },
  {
    id: 'u2',
    name: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    role: 'Site Engineer'
  },
  {
    id: 'u3',
    name: 'Michael Brown',
    avatar: 'https://i.pravatar.cc/150?u=michael',
    role: 'Architect'
  },
  {
    id: 'u4',
    name: 'Emily Davis',
    avatar: 'https://i.pravatar.cc/150?u=emily',
    role: 'Construction Lead'
  }
];

// Mock projects
export const projects: Project[] = [
  {
    id: 'p1',
    name: 'City Center Tower',
    description: 'A 40-story commercial building in downtown with retail spaces, offices, and a rooftop garden.',
    status: 'active',
    startDate: '2023-02-15',
    endDate: '2024-08-30',
    progress: 45,
    lead: users[0],
    team: [users[1], users[2], users[3]],
    tasks: [],
    client: 'Metropolis Developments',
    budget: {
      total: 75000000,
      spent: 32500000,
      currency: 'USD'
    },
    location: '123 Main St, Downtown'
  },
  {
    id: 'p2',
    name: 'Riverside Residences',
    description: 'Luxury residential complex with 150 units, underground parking, and waterfront amenities.',
    status: 'planning',
    startDate: '2023-09-01',
    endDate: '2025-11-30',
    progress: 15,
    lead: users[0],
    team: [users[1], users[3]],
    tasks: [],
    client: 'Riverfront Properties LLC',
    budget: {
      total: 48000000,
      spent: 7200000,
      currency: 'USD'
    },
    location: '456 River Blvd, Eastside'
  },
  {
    id: 'p3',
    name: 'North Valley Hospital',
    description: 'State-of-the-art medical facility with 250 beds, emergency department, and specialized care units.',
    status: 'active',
    startDate: '2022-11-10',
    endDate: '2025-03-15',
    progress: 62,
    lead: users[0],
    team: [users[2], users[3]],
    tasks: [],
    client: 'Valley Health Systems',
    budget: {
      total: 120000000,
      spent: 74400000,
      currency: 'USD'
    },
    location: '789 Health Drive, North Valley'
  },
  {
    id: 'p4',
    name: 'Metro Station Renovation',
    description: 'Comprehensive renovation of the historic central metro station, including structural repairs and modernization.',
    status: 'on-hold',
    startDate: '2023-04-20',
    endDate: '2024-06-30',
    progress: 28,
    lead: users[0],
    team: [users[1], users[2]],
    tasks: [],
    client: 'City Transportation Authority',
    budget: {
      total: 35000000,
      spent: 9800000,
      currency: 'USD'
    },
    location: 'Central Metro Station, Downtown'
  },
];

// Mock tasks
const generateTasks = (): Task[] => {
  const tasks: Task[] = [];
  
  // Tasks for Project 1
  tasks.push(
    {
      id: 't1',
      title: 'Foundation inspection',
      description: 'Perform comprehensive inspection of foundation work with structural engineer',
      status: 'done',
      priority: 'high',
      assignee: users[1],
      reporter: users[0],
      dueDate: '2023-06-10',
      createdAt: '2023-05-28',
      updatedAt: '2023-06-08',
      comments: [
        {
          id: 'c1',
          text: 'All inspections completed, report attached',
          author: users[1],
          createdAt: '2023-06-08'
        }
      ],
      attachments: [
        {
          id: 'a1',
          name: 'foundation_report.pdf',
          url: '#',
          type: 'application/pdf',
          size: 2540000,
          uploadedBy: users[1],
          uploadedAt: '2023-06-08'
        }
      ],
      projectId: 'p1'
    },
    {
      id: 't2',
      title: 'Electrical wiring for floors 1-10',
      description: 'Install electrical wiring and junction boxes for the first 10 floors according to approved plans',
      status: 'in-progress',
      priority: 'medium',
      assignee: users[3],
      reporter: users[0],
      dueDate: '2023-07-15',
      createdAt: '2023-06-15',
      updatedAt: '2023-06-28',
      comments: [
        {
          id: 'c2',
          text: 'Completed floors 1-6, will finish remaining floors by deadline',
          author: users[3],
          createdAt: '2023-06-28'
        }
      ],
      attachments: [],
      projectId: 'p1'
    },
    {
      id: 't3',
      title: 'HVAC system design review',
      description: 'Review and approve final HVAC system designs for all floors',
      status: 'review',
      priority: 'medium',
      assignee: users[2],
      reporter: users[0],
      dueDate: '2023-07-05',
      createdAt: '2023-06-20',
      updatedAt: '2023-07-01',
      comments: [
        {
          id: 'c3',
          text: 'Design review completed, awaiting final approval',
          author: users[2],
          createdAt: '2023-07-01'
        }
      ],
      attachments: [
        {
          id: 'a2',
          name: 'hvac_plans_final.dwg',
          url: '#',
          type: 'application/dwg',
          size: 8750000,
          uploadedBy: users[2],
          uploadedAt: '2023-07-01'
        }
      ],
      projectId: 'p1'
    },
    
    // Tasks for Project 2
    {
      id: 't4',
      title: 'Site survey and analysis',
      description: 'Complete comprehensive topographical survey and soil analysis of the entire site',
      status: 'done',
      priority: 'high',
      assignee: users[1],
      reporter: users[0],
      dueDate: '2023-09-15',
      createdAt: '2023-08-20',
      updatedAt: '2023-09-14',
      comments: [
        {
          id: 'c4',
          text: 'Survey completed, results indicate good soil stability across the site',
          author: users[1],
          createdAt: '2023-09-14'
        }
      ],
      attachments: [
        {
          id: 'a3',
          name: 'site_survey_report.pdf',
          url: '#',
          type: 'application/pdf',
          size: 4280000,
          uploadedBy: users[1],
          uploadedAt: '2023-09-14'
        }
      ],
      projectId: 'p2'
    },
    {
      id: 't5',
      title: 'Initial architectural drawings',
      description: 'Prepare initial architectural drawings for client review',
      status: 'todo',
      priority: 'medium',
      assignee: users[2],
      reporter: users[0],
      dueDate: '2023-10-30',
      createdAt: '2023-09-20',
      updatedAt: '2023-09-20',
      comments: [],
      attachments: [],
      projectId: 'p2'
    },
    
    // Tasks for Project 3
    {
      id: 't6',
      title: 'Medical equipment installation plan',
      description: 'Develop detailed installation plan for all specialized medical equipment',
      status: 'in-progress',
      priority: 'high',
      assignee: users[3],
      reporter: users[0],
      dueDate: '2023-07-30',
      createdAt: '2023-06-15',
      updatedAt: '2023-07-10',
      comments: [
        {
          id: 'c5',
          text: 'Working with medical equipment vendors to finalize installation requirements',
          author: users[3],
          createdAt: '2023-07-10'
        }
      ],
      attachments: [],
      projectId: 'p3'
    },
    {
      id: 't7',
      title: 'Operating room construction',
      description: 'Complete construction of specialized operating rooms according to medical specifications',
      status: 'in-progress',
      priority: 'urgent',
      assignee: users[2],
      reporter: users[0],
      dueDate: '2023-08-15',
      createdAt: '2023-05-10',
      updatedAt: '2023-07-05',
      comments: [
        {
          id: 'c6',
          text: 'First two operating rooms are 90% complete, starting on remaining three next week',
          author: users[2],
          createdAt: '2023-07-05'
        }
      ],
      attachments: [
        {
          id: 'a4',
          name: 'or_progress_photos.zip',
          url: '#',
          type: 'application/zip',
          size: 15600000,
          uploadedBy: users[2],
          uploadedAt: '2023-07-05'
        }
      ],
      projectId: 'p3'
    },
    
    // Tasks for Project 4
    {
      id: 't8',
      title: 'Structural assessment',
      description: 'Conduct comprehensive structural assessment of existing station infrastructure',
      status: 'done',
      priority: 'high',
      assignee: users[1],
      reporter: users[0],
      dueDate: '2023-05-10',
      createdAt: '2023-04-25',
      updatedAt: '2023-05-09',
      comments: [
        {
          id: 'c7',
          text: 'Assessment completed, identified several critical areas requiring immediate attention',
          author: users[1],
          createdAt: '2023-05-09'
        }
      ],
      attachments: [
        {
          id: 'a5',
          name: 'structural_assessment.pdf',
          url: '#',
          type: 'application/pdf',
          size: 8900000,
          uploadedBy: users[1],
          uploadedAt: '2023-05-09'
        }
      ],
      projectId: 'p4'
    },
    {
      id: 't9',
      title: 'Historical preservation compliance',
      description: 'Ensure all renovation work complies with historical preservation requirements',
      status: 'on-hold',
      priority: 'medium',
      assignee: users[2],
      reporter: users[0],
      dueDate: '2023-07-20',
      createdAt: '2023-05-15',
      updatedAt: '2023-06-10',
      comments: [
        {
          id: 'c8',
          text: 'Work on hold pending approval from Historical Preservation Committee',
          author: users[0],
          createdAt: '2023-06-10'
        }
      ],
      attachments: [],
      projectId: 'p4'
    }
  );
  
  return tasks;
};

const tasks = generateTasks();

// Assign tasks to projects
projects.forEach(project => {
  project.tasks = tasks.filter(task => task.projectId === project.id);
});

// Helper functions
export const getProjects = (): Project[] => {
  return projects;
};

export const getProject = (id: string): Project | undefined => {
  return projects.find(project => project.id === id);
};

export const getTasks = (projectId?: string): Task[] => {
  if (projectId) {
    return tasks.filter(task => task.projectId === projectId);
  }
  return tasks;
};

export const getTask = (id: string): Task | undefined => {
  return tasks.find(task => task.id === id);
};

export const getUsers = (): User[] => {
  return users;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'planning':
    case 'backlog':
      return 'bg-gray-200 text-gray-800';
    case 'active':
    case 'todo':
      return 'bg-blue-100 text-blue-800';
    case 'on-hold':
      return 'bg-yellow-100 text-yellow-800';
    case 'in-progress':
      return 'bg-indigo-100 text-indigo-800';
    case 'review':
      return 'bg-purple-100 text-purple-800';
    case 'completed':
    case 'done':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'low':
      return 'bg-blue-100 text-blue-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'urgent':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(value);
};

export const calculateDaysRemaining = (endDate: string | null): number => {
  if (!endDate) return 0;
  const end = new Date(endDate);
  const today = new Date();
  const diffTime = end.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};
