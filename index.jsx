import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import VoiceLearning from "./VoiceLearning";

import CaseAnalysis from "./CaseAnalysis";

import VirtualSurgeryLab from "./VirtualSurgeryLab";

import AnimalTreatment from "./AnimalTreatment";

import ContactAssistant from "./ContactAssistant";

import TreatmentPlan from "./TreatmentPlan";

import Glossary from "./Glossary";

import DataIntegration from "./DataIntegration";

import Diagnostics from "./Diagnostics";

import SystemTesting from "./SystemTesting";

import Documentation from "./Documentation";

import ProjectDelivery from "./ProjectDelivery";

import Conversations from "./Conversations";

import QualityAnalytics from "./QualityAnalytics";

import Quizzes from "./Quizzes";

import QuizResults from "./QuizResults";

import AttemptReview from "./AttemptReview";

import academicAssistant from "./academicAssistant";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    VoiceLearning: VoiceLearning,
    
    CaseAnalysis: CaseAnalysis,
    
    VirtualSurgeryLab: VirtualSurgeryLab,
    
    AnimalTreatment: AnimalTreatment,
    
    ContactAssistant: ContactAssistant,
    
    TreatmentPlan: TreatmentPlan,
    
    Glossary: Glossary,
    
    DataIntegration: DataIntegration,
    
    Diagnostics: Diagnostics,
    
    SystemTesting: SystemTesting,
    
    Documentation: Documentation,
    
    ProjectDelivery: ProjectDelivery,
    
    Conversations: Conversations,
    
    QualityAnalytics: QualityAnalytics,
    
    Quizzes: Quizzes,
    
    QuizResults: QuizResults,
    
    AttemptReview: AttemptReview,
    
    academicAssistant: academicAssistant,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/VoiceLearning" element={<VoiceLearning />} />
                
                <Route path="/CaseAnalysis" element={<CaseAnalysis />} />
                
                <Route path="/VirtualSurgeryLab" element={<VirtualSurgeryLab />} />
                
                <Route path="/AnimalTreatment" element={<AnimalTreatment />} />
                
                <Route path="/ContactAssistant" element={<ContactAssistant />} />
                
                <Route path="/TreatmentPlan" element={<TreatmentPlan />} />
                
                <Route path="/Glossary" element={<Glossary />} />
                
                <Route path="/DataIntegration" element={<DataIntegration />} />
                
                <Route path="/Diagnostics" element={<Diagnostics />} />
                
                <Route path="/SystemTesting" element={<SystemTesting />} />
                
                <Route path="/Documentation" element={<Documentation />} />
                
                <Route path="/ProjectDelivery" element={<ProjectDelivery />} />
                
                <Route path="/Conversations" element={<Conversations />} />
                
                <Route path="/QualityAnalytics" element={<QualityAnalytics />} />
                
                <Route path="/Quizzes" element={<Quizzes />} />
                
                <Route path="/QuizResults" element={<QuizResults />} />
                
                <Route path="/AttemptReview" element={<AttemptReview />} />
                
                <Route path="/academicAssistant" element={<academicAssistant />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}