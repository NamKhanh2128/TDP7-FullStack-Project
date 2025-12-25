import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, MapPin, Users } from 'lucide-react';
import { MemberCard } from '@/components/user/MemberCard';
import { MemberDetailPopup } from '@/components/user/MemberDetailPopup';
import { currentHousehold, HouseholdMember } from '@/data/mockData';

const HouseholdPage = () => {
  const [selectedMember, setSelectedMember] = useState<HouseholdMember | null>(null);

  return (
    <div className="container py-6">
      {/* Household Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card p-5 shadow-card"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-primary">
            <Home className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">Mã hộ</p>
            <p className="font-bold text-foreground">{currentHousehold.code}</p>
          </div>
        </div>
        
        <div className="mt-4 flex items-start gap-3 rounded-lg bg-muted/50 p-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-foreground">{currentHousehold.address}</p>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{currentHousehold.members.length} thành viên</span>
        </div>
      </motion.div>

      {/* Members List */}
      <section className="mt-6">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4 text-lg font-semibold text-foreground"
        >
          Thành viên hộ gia đình
        </motion.h2>
        <div className="space-y-3">
          {currentHousehold.members.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <MemberCard
                member={member}
                onClick={() => setSelectedMember(member)}
              />
            </motion.div>
          ))}
        </div>
      </section>

      <MemberDetailPopup
        member={selectedMember}
        open={!!selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
};

export default HouseholdPage;
