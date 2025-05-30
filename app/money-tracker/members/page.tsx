'use client';

import { useState } from 'react';
import { useMoneyTracker } from '@/hooks/useMoneyTracker';
import { Button } from '@/components/ui/button';
import { getGravatarUrl, getInitials } from '@/lib/utils';
import type { Member } from '@/types/money-tracker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Pencil, Trash2, Search } from 'lucide-react';

export default function MembersPage() {
    const {
        members = [],
        addMember,
        updateMember,
        deleteMember
    } = useMoneyTracker();

    const [isAddingMember, setIsAddingMember] = useState(false);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberEmail, setNewMemberEmail] = useState('');

    const handleAddMember = async () => {
        if (!newMemberName.trim() || !newMemberEmail.trim()) return;

        try {
            await addMember({
                name: newMemberName.trim(),
                email: newMemberEmail.trim().toLowerCase(),
            });

            setNewMemberName('');
            setNewMemberEmail('');
            setIsAddingMember(false);
        } catch (error) {
            console.error('Error adding member:', error);
        }
    };

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Members</h1>
                <Button onClick={() => setIsAddingMember(true)}>Add Member</Button>
            </div>

            <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New Member</DialogTitle>
                        <DialogDescription>
                            Add a new member to your expense tracking group.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={newMemberName}
                                onChange={(e) => setNewMemberName(e.target.value)}
                                className="col-span-3"
                                placeholder="Enter member name"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={newMemberEmail}
                                onChange={(e) => setNewMemberEmail(e.target.value)}
                                className="col-span-3"
                                placeholder="Enter member email"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddingMember(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddMember}>Add Member</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {members.length === 0 ? (
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold mb-2">No Members Yet</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Add members to start tracking expenses
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    {member.avatarUrl ? (
                                        <img
                                            src={member.avatarUrl}
                                            alt={member.name}
                                            className="w-12 h-12 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                            <span className="text-lg font-medium">
                                                {getInitials(member.name)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold">{member.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {member.email}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteMember(member.id)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 