// Demo rasmlar (Unsplash). Rasm yuklanmasa SmartImage chiroyli gradient zaxira ko'rsatadi.
const u = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;

export const IMAGES = {
  football: [
    u('photo-1574629810360-7efbbe195018'),
    u('photo-1431324155629-1a6deb1dec8d'),
    u('photo-1529900748604-07564a03e7a6'),
  ],
  tennis: [u('photo-1554068865-24cecd4e34b8'), u('photo-1595435934249-5df7ed86e1c0')],
  swimming: [u('photo-1576013551627-0cc20b96c2a7'), u('photo-1519315901367-f34ff9154487')],
  gym: [u('photo-1534438327276-14e5300c3a48'), u('photo-1571902943202-507ec2618e8f')],
  basketball: [u('photo-1546519638-68e109498ffc'), u('photo-1504450758481-7338eba7524a')],
  boxing: [u('photo-1549719386-74dfcbf7dbed'), u('photo-1517438322307-e67111335449')],
  yoga: [u('photo-1544367567-0f2fcb009e0b'), u('photo-1506126613408-eca07ce68773')],
  volleyball: [u('photo-1612872087720-bb876e2e67d1'), u('photo-1592656094267-764a45160876')],
  workout: [
    u('photo-1517836357463-d25dfeac3438'),
    u('photo-1571019613454-1cb2f99b2d8b'),
    u('photo-1518611012118-696072aa579a'),
    u('photo-1599058917212-d750089bc07e'),
  ],
  running: [u('photo-1552674605-db6ffd4facb5'), u('photo-1571008887538-b36bb32f4571')],
  avatar: u('photo-1500648767791-00dcc994a43e'),
};
