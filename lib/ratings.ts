export const ratingConfig = {
  worldClass: {
    range: [81, 99],
    color: '#34a853', // Google Green
    label: 'World Class',
    desc: 'Elite performance at the highest competitive level'
  },
  expert: {
    range: [61, 80],
    color: '#1a73e8', // Google Blue
    label: 'Expert',
    desc: 'Advanced skills with consistent execution'
  },
  competitive: {
    range: [41, 60],
    color: '#fbbc04', // Google Yellow
    label: 'Competitive',
    desc: 'Solid fundamentals with good game awareness'
  },
  developing: {
    range: [21, 40],
    color: '#ea4335', // Google Red
    label: 'Developing',
    desc: 'Basic understanding with growing experience'
  },
  beginner: {
    range: [1, 20],
    color: '#9334e6', // Google Purple
    label: 'Beginner',
    desc: 'Learning the fundamentals of the game'
  }
};

export function getRatingLevel(value: number) {
  if (value >= ratingConfig.worldClass.range[0]) return ratingConfig.worldClass;
  if (value >= ratingConfig.expert.range[0]) return ratingConfig.expert;
  if (value >= ratingConfig.competitive.range[0]) return ratingConfig.competitive;
  if (value >= ratingConfig.developing.range[0]) return ratingConfig.developing;
  return ratingConfig.beginner;
}

export function getRatingStyles(value: number) {
  const level = getRatingLevel(value);
  return {
    background: `${level.color}1A`, // 10% opacity
    color: level.color,
    label: level.label
  };
} 