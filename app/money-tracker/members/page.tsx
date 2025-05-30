'use client';

import { useState } from 'react';
import { useMoneyTracker } from '@/hooks/useMoneyTracker';
import { Button } from '@/components/ui/button';
import { getGravatarUrl, getInitials } from '@/lib/utils';
import type { Member } from '@/types/money-tracker';

export default function MembersPage() {
    const { state, addMember, updateMember, deleteMember } = useMoneyTracker();

    const [isAddingMember, setIsAddingMember] = useState(false);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberEmail, setNewMemberEmail] = useState('');

    const handleAddMember = () => {
        if (!newMemberName.trim() || !newMemberEmail.trim()) return;

        addMember({
            name: newMemberName.trim(),
            email: newMemberEmail.trim().toLowerCase(),
        });

        setNewMemberName('');
        setNewMemberEmail('');
        setIsAddingMember(false);
    };

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Members</h1>
                <Button onClick={() => setIsAddingMember(true)}>Add Member</Button>
            </div>

            {isAddingMember && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Add New Member</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newMemberName}
                                    onChange={(e) => setNewMemberName(e.target.value)}
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="Enter member name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    value={newMemberEmail}
                                    onChange={(e) => setNewMemberEmail(e.target.value)}
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="Enter member email"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsAddingMember(false)}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleAddMember}>Add Member</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {state.members.length === 0 ? (
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold mb-2">No Members Yet</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Add members to start tracking expenses
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {state.members.map((member) => (
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