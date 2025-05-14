'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Customer } from '@/context/CustomersContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BadgeCheck, Calendar, DollarSign, MapPin, User, Phone, TrendingUp, ShieldAlert, UserCheck, Bot } from 'lucide-react';
import { Source_Serif_4 } from 'next/font/google';
import {
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartLegend, 
  ChartLegendContent 
} from '@/components/ui/chart';

const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600'], // Regular and Semi-bold
});

// Define the debt thresholds
const MEDIUM_DEBT_THRESHOLD = 4000;
const HIGH_DEBT_THRESHOLD = 10000;

// Define Debt Status colors (adjust as needed)
const debtStatusColors: { [key: string]: string } = {
  'Active': 'bg-blue-100 text-blue-700',
  'Pending': 'bg-yellow-100 text-yellow-700',
  'Closed': 'bg-gray-100 text-gray-700',
  'Default': 'bg-red-100 text-red-700',
  'Settled': 'bg-green-100 text-green-700', // Added for default history example
  // Add other statuses as necessary
};

interface ConversationSummary {
  date: Date;
  summary: string;
  outcome: 'successful' | 'unsuccessful' | 'pending';
}

interface DefaultHistoryEntry {
  date: string;
  event: string;
  amount?: number;
}

interface CustomerDetailsModalProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationHistory?: ConversationSummary[];
  onPrepareAICall?: (customer: Customer) => void;
}

interface InfoItemProps {
  icon: any;
  label: string;
  value: string;
}

const InfoItem = ({ icon: Icon, label, value }: InfoItemProps) => (
  <div className="grid grid-cols-[auto,1fr] items-center gap-x-2 gap-y-1">
    <Icon className="h-4 w-4 text-muted-foreground mt-1" />
    <p className="text-sm font-medium text-muted-foreground col-start-2">{label}</p>
    <p className="text-base col-start-2">{value}</p>
  </div>
);

// Helper to get priority details based on amount
function getPriorityDetails(amount: number) {
  if (amount > HIGH_DEBT_THRESHOLD) {
    return {
      level: 'High',
      badgeColor: 'bg-red-100 text-red-700',
      bgColor: 'bg-red-50 border-red-200',
      textColor: 'text-red-800',
      amountColor: 'text-red-900',
      iconColor: 'text-red-600', // Color for the card icon
    };
  } else if (amount > MEDIUM_DEBT_THRESHOLD) {
    return {
      level: 'Medium',
      badgeColor: 'bg-amber-100 text-amber-700',
      bgColor: 'bg-amber-50 border-amber-200',
      textColor: 'text-amber-800',
      amountColor: 'text-amber-900',
      iconColor: 'text-amber-600',
    };
  } else {
    return {
      level: 'Standard',
      badgeColor: 'bg-green-100 text-green-700',
      bgColor: 'bg-green-50 border-green-200',
      textColor: 'text-green-800',
      amountColor: 'text-green-900',
      iconColor: 'text-green-600',
    };
  }
}

export function CustomerDetailsModal({
  customer,
  open,
  onOpenChange,
  conversationHistory = [],
  onPrepareAICall,
}: CustomerDetailsModalProps) {
  // Generate mock data for new UI elements
  const [mockExperianScore, setMockExperianScore] = useState(0);
  const [mockDefaultHistory, setMockDefaultHistory] = useState<DefaultHistoryEntry[]>([]);

  useEffect(() => {
    if (open) { // Regenerate when modal opens for different customers or refresh
      // Mock Experian Score (between 300 and 850)
      if (customer.name === "John Smith") {
        setMockExperianScore(667);
      } else {
        setMockExperianScore(Math.floor(Math.random() * (850 - 300 + 1)) + 300);
      }

      // Mock Default History
      const generateDefaultHistory = () => {
        const history: DefaultHistoryEntry[] = [];
        const numEntries = Math.floor(Math.random() * 5) + 2; // 2 to 6 entries for better chart visualization
        const today = new Date();
        const eventTypes = ['Missed Payment', 'Account Defaulted', 'Late Fee Incurred'];

        for (let i = 0; i < numEntries; i++) {
          const pastDate = new Date(today);
          pastDate.setMonth(today.getMonth() - Math.floor(Math.random() * 12)); // Within last 12 months
          pastDate.setDate(Math.floor(Math.random() * 28) + 1);
          const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
          history.push({
            date: pastDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            event: event,
            amount: Math.floor(Math.random() * (event === 'Account Defaulted' ? 1000 : 300)) + 50
          });
        }
        // Add a positive entry sometimes
        if (Math.random() > 0.5) {
            const pastDate = new Date(today);
            pastDate.setMonth(today.getMonth() - Math.floor(Math.random() * 6)); 
            pastDate.setDate(Math.floor(Math.random() * 28) + 1);
            history.push({
                date: pastDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                event: 'Payment Received',
                amount: Math.floor(Math.random() * 200) + 50
            });
        }
        history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date for chart
        return history;
      };
      setMockDefaultHistory(generateDefaultHistory());
    }
  }, [open, customer]); // Rerun if modal is reopened or customer changes

  const getRiskProfile = (score: number, totalOwed: number) => {
    let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    let callRecommendation: 'AI Call Suitable' | 'Human Review';
    let riskColor: string;
    let recommendationIcon;
    let recommendationColor: string;

    // Determine Risk Level and its badge color first (this remains independent of the 650 rule for recommendation)
    if (score < 580 || totalOwed > HIGH_DEBT_THRESHOLD * 1.5) {
      riskLevel = 'Critical';
      riskColor = 'bg-red-100 text-red-700';
    } else if (score < 670 || totalOwed > MEDIUM_DEBT_THRESHOLD) {
      riskLevel = 'High';
      riskColor = 'bg-orange-100 text-orange-700';
    } else if (score < 740) {
      riskLevel = 'Medium';
      riskColor = 'bg-yellow-100 text-yellow-700';
    } else { // score >= 740
      riskLevel = 'Low';
      riskColor = 'bg-green-100 text-green-700';
    }

    // Now, determine Call Recommendation and its specific UI based on the score > 650 rule
    if (score > 650) {
      callRecommendation = 'AI Call Suitable';
      recommendationIcon = Bot;
      recommendationColor = 'text-green-600'; // AI calls are generally green
    } else { // score <= 650
      callRecommendation = 'Human Review';
      // For Human Review, icons/colors are based on the severity determined above
      if (riskLevel === 'Critical') {
        recommendationIcon = UserCheck;
        recommendationColor = 'text-red-600';
      } else { // Includes High risk, or Medium/Low risk that fell into score <= 650 (which would make them at least High concern for human review)
        recommendationIcon = User;
        recommendationColor = 'text-orange-600'; // Default to orange for non-critical human reviews
      }
    }

    return { riskLevel, callRecommendation, riskColor, recommendationIcon, recommendationColor };
  };

  const { riskLevel, callRecommendation, riskColor, recommendationIcon: RecommendationIcon, recommendationColor } = getRiskProfile(mockExperianScore, customer.totalOwed);

  const getExperianScoreColor = (score: number) => {
    if (score < 580) return 'text-red-600'; // Poor
    if (score < 670) return 'text-orange-500'; // Fair
    if (score < 740) return 'text-yellow-500'; // Good
    if (score < 800) return 'text-green-500'; // Very Good
    return 'text-green-600'; // Excellent
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader className="pt-6 px-6">
          <DialogTitle className={`text-2xl font-semibold ${sourceSerif4.className}`}>Customer Profile</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-8rem)] pr-2">
          <div className="grid gap-4 p-6 pt-4">
            {/* Customer Header Card */}
            <Card className="overflow-hidden border border-neutral-200 shadow-sm">
              <CardHeader className="p-4 bg-neutral-50 border-b border-neutral-200">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-14 w-14 border-2 border-background mt-1">
                    <AvatarFallback className="text-lg">{customer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className={`text-2xl font-semibold ${sourceSerif4.className}`}>{customer.name}</CardTitle>
                    <div className="flex space-x-4 text-sm text-muted-foreground mt-1">
                      <span>Age: {customer.age}</span>
                      <span>Language: {customer.language}</span>
                      <span>SSN: ***-**-{customer.ssn.slice(-4)}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              {/* Removed content section as info is now in header */}
            </Card>

            {/* Combined Debt Overview Card */}
            {(() => {
              const priority = getPriorityDetails(customer.totalOwed);
              const statusColor = debtStatusColors[customer.debtStatus] || 'bg-gray-100 text-gray-700'; // Default color
              return (
                <Card className={`border ${priority.bgColor} shadow-sm`}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`flex items-center text-xl ${sourceSerif4.className} font-semibold ${priority.textColor}`}>
                      <DollarSign className={`mr-2 h-5 w-5 ${priority.iconColor}`} />
                      Debt Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 pt-2">
                    {/* Total Amount Owed */}
                    <div className={`flex justify-between items-center p-3 rounded-md border ${priority.bgColor} border-opacity-50`}>
                      <div>
                        <span className={`text-base font-medium ${priority.textColor}`}>Total Amount Owed</span>
                        <span className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded ${priority.badgeColor}`}>
                          {priority.level} Priority
                        </span>
                      </div>
                      <span className={`text-2xl font-bold ${priority.amountColor}`}>${customer.totalOwed.toLocaleString()}</span>
                    </div>
                    {/* Other Debt Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3 pt-1">
                       <InfoItem icon={Calendar} label="Debt Age" value={`${customer.debtAge} days`} />
                       <InfoItem icon={DollarSign} label="Type" value={customer.typeOfDebt} />
                       <div> {/* Custom layout for Status Badge */} 
                          <p className="text-sm font-medium text-muted-foreground">Status</p>
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${statusColor}`}>
                            {customer.debtStatus}
                          </span>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Risk & Credit Profile Card */}
            <Card className="border border-neutral-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className={`flex items-center text-xl ${sourceSerif4.className} font-semibold`}>
                  <ShieldAlert className="mr-2 h-5 w-5 text-blue-600" /> Risk & Credit Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-3">
                {/* Experian Score */}
                <div className="space-y-2 p-3 rounded-md bg-neutral-50 border border-neutral-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">Experian Score</p>
                    <TrendingUp className={`h-5 w-5 ${getExperianScoreColor(mockExperianScore)}`} />
                  </div>
                  <p className={`text-3xl font-bold ${getExperianScoreColor(mockExperianScore)}`}>{mockExperianScore}</p>
                  <div className={`text-xs font-semibold px-2 py-1 rounded-full inline-block ${riskColor}`}>
                    Risk Level: {riskLevel}
                  </div>
                </div>

                {/* Call Recommendation */}
                <div className="space-y-2 p-3 rounded-md bg-neutral-50 border border-neutral-200 flex flex-col justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Call Recommendation</p>
                        <div className={`flex items-center mt-1`}>
                            <RecommendationIcon className={`h-6 w-6 mr-2 ${recommendationColor}`} />
                            <p className={`text-lg font-semibold ${recommendationColor}`}>{callRecommendation}</p>
                        </div>
                    </div>
                    {callRecommendation === 'AI Call Suitable' && onPrepareAICall && (
                        <Button 
                            size="sm" 
                            className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => {
                                onPrepareAICall(customer);
                                onOpenChange(false); // Close modal after initiating preparation
                            }}
                        >
                            <Bot className="mr-2 h-4 w-4" /> Initiate AI Call
                        </Button>
                    )}
                    <p className="text-xs text-muted-foreground pt-1">
                        Based on current risk assessment: {riskLevel} risk profile.
                    </p>
                </div>

                {/* Default History Placeholder/Graph */}
                <div className="md:col-span-2 space-y-2 p-3 rounded-md bg-neutral-50 border border-neutral-200">
                  <p className="text-sm font-medium text-muted-foreground">Payment & Default History</p>
                  {mockDefaultHistory.length > 0 ? (
                    <ChartContainer config={{}} className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mockDefaultHistory} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="date" 
                            tickLine={false} 
                            axisLine={false} 
                            tickMargin={8} 
                            fontSize={12} 
                          />
                          <YAxis 
                            tickLine={false} 
                            axisLine={false} 
                            tickMargin={8} 
                            fontSize={12} 
                            tickFormatter={(value) => `$${value}`}
                          />
                          <ChartTooltip 
                            cursor={false} 
                            content={<ChartTooltipContent indicator="dashed" />}
                          />
                          <ChartLegend content={<ChartLegendContent />} />
                          <Line 
                            type="monotone" 
                            dataKey="amount" 
                            stroke="hsl(var(--chart-1))" // Use primary chart color
                            strokeWidth={2}
                            dot={{ r: 4, fill: "hsl(var(--chart-1))" }}
                            activeDot={{ r: 6 }}
                            name="Amount"
                          />
                          {/* 
                            // If we wanted to differentiate payment received vs default with different lines or colors:
                            // We'd need to process mockDefaultHistory to separate these amounts into different keys,
                            // e.g., defaultAmount and paymentAmount, then use two <Line> components.
                            // For now, a single line represents the 'amount' of any event.
                           */}
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No significant payment or default history found.</p>
                  )}
                  <p className="text-xs text-muted-foreground pt-1">Recent financial events overview.</p>
                </div>
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card className="border border-neutral-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className={`flex items-center text-xl ${sourceSerif4.className} font-semibold`}>
                  <MapPin className="mr-2 h-5 w-5" /> Location
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <InfoItem icon={MapPin} label="City" value={customer.city} />
                <InfoItem icon={MapPin} label="State" value={customer.state} />
                <InfoItem icon={MapPin} label="ZIP Code" value={customer.zipcode} />
              </CardContent>
            </Card>

            {/* Conversation History Card */}
            {conversationHistory.length > 0 && (
              <Card className="border border-neutral-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className={`flex items-center justify-between text-xl ${sourceSerif4.className} font-semibold`}>
                    <div className="flex items-center">
                        <Phone className="mr-2 h-5 w-5" />
                        Conversation History
                    </div>
                    <span className="text-sm font-normal px-2 py-1 rounded bg-muted text-muted-foreground">
                        {conversationHistory.length} entries
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 pt-2">
                  {conversationHistory.map((conversation, index) => (
                    <div key={index} className="space-y-1 border-b pb-3 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">
                          {conversation.date.toLocaleDateString()} at {conversation.date.toLocaleTimeString()}
                        </p>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          conversation.outcome === 'successful'
                            ? 'bg-green-100 text-green-700'
                            : conversation.outcome === 'unsuccessful'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {conversation.outcome.charAt(0).toUpperCase() + conversation.outcome.slice(1)}
                        </span>
                      </div>
                      <p className={`text-sm text-muted-foreground ${sourceSerif4.className}`}>{conversation.summary}</p>
                      {conversation.outcome == 'successful' && (
                        <p className="text-sm text-muted-foreground font-bold">
                          Payment Portal Link: <a href={`https://debtpayway.lovable.app`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://debtpayway.lovable.app</a>
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}