import { supabase } from './supabase';

type EmailTemplate = 
  | 'welcome'
  | 'contribution_received'
  | 'loan_approved'
  | 'loan_repayment_due'
  | 'meeting_reminder'
  | 'password_reset';

interface EmailData {
  to: string;
  name: string;
  subject: string;
  template: EmailTemplate;
  data: Record<string, string>;
}

const emailTemplates: Record<EmailTemplate, (data: Record<string, string>) => { subject: string; body: string }> = {
  welcome: (d) => ({
    subject: 'Welcome to ChamaOS!',
    body: `Hi ${d.name},\n\nWelcome to ChamaOS - Kenya's smartest chama management platform!\n\nYour chama "${d.chamaName}" has been set up successfully.\n\nGet started by:\n1. Adding your members\n2. Recording first contributions\n3. Setting up loans\n\nBest,\nThe ChamaOS Team`,
  }),

  contribution_received: (d) => ({
    subject: `Contribution Received - KSh ${d.amount}`,
    body: `Hi ${d.name},\n\nWe received your contribution of KSh ${d.amount} for ${d.month}.\n\nReference: ${d.mpesaRef}\n\nThank you for your commitment!\n\nBest,\n${d.chamaName}`,
  }),

  loan_approved: (d) => ({
    subject: 'Loan Approved!',
    body: `Hi ${d.name},\n\nGreat news! Your loan application for KSh ${d.amount} has been approved.\n\nAmount: KSh ${d.amount}\nInterest: ${d.interest}%\nDue Date: ${d.dueDate}\n\nVisit your dashboard to view the full details.\n\nBest,\n${d.chamaName}`,
  }),

  loan_repayment_due: (d) => ({
    subject: 'Loan Repayment Reminder',
    body: `Hi ${d.name},\n\nThis is a reminder that your loan repayment of KSh ${d.amount} is due on ${d.dueDate}.\n\nCurrent Balance: KSh ${d.balance}\n\nPlease ensure timely repayment to maintain your good standing.\n\nBest,\n${d.chamaName}`,
  }),

  meeting_reminder: (d) => ({
    subject: `Meeting Reminder: ${d.meetingTitle}`,
    body: `Hi ${d.name},\n\nThis is a reminder about the upcoming meeting:\n\nTitle: ${d.meetingTitle}\nDate: ${d.date}\nTime: ${d.time}\nVenue: ${d.venue}\n\nAgenda:\n${d.agenda}\n\nWe look forward to your attendance!\n\nBest,\n${d.chamaName}`,
  }),

  password_reset: (d) => ({
    subject: 'Reset your ChamaOS password',
    body: `Hi ${d.name},\n\nClick the link below to reset your password:\n\n${d.resetLink}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest,\nChamaOS Team`,
  }),
};

class EmailService {
  private async sendEmail(emailData: EmailData): Promise<boolean> {    
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: emailData.to,
        subject: emailData.subject,
        body: emailTemplates[emailData.template](emailData.data).body,
      },
    });

    if (error) {
      console.error('Email send error:', error);
      return false;
    }

    return true;
  }

  async sendWelcomeEmail(email: string, name: string, chamaName: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      name,
      template: 'welcome',
      subject: 'Welcome to ChamaOS!',
      data: { name, chamaName },
    });
  }

  async sendContributionReceipt(email: string, name: string, amount: string, month: string, mpesaRef: string, chamaName: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      name,
      template: 'contribution_received',
      subject: `Contribution Received - KSh ${amount}`,
      data: { name, amount, month, mpesaRef, chamaName },
    });
  }

  async sendLoanApproval(email: string, name: string, amount: string, interest: string, dueDate: string, chamaName: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      name,
      template: 'loan_approved',
      subject: 'Loan Approved!',
      data: { name, amount, interest, dueDate, chamaName },
    });
  }

  async sendMeetingReminder(email: string, name: string, meetingTitle: string, date: string, time: string, venue: string, agenda: string, chamaName: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      name,
      template: 'meeting_reminder',
      subject: `Meeting Reminder: ${meetingTitle}`,
      data: { name, meetingTitle, date, time, venue, agenda, chamaName },
    });
  }
}

export const emailService = new EmailService();
