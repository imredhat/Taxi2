import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8faf9' },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#e9efed',
    alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start',
  },
  backText: { fontSize: 20, color: '#17212a' },
  stepBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 999, backgroundColor: '#e1f6f0',
  },
  stepBadgeText: { color: '#07846c', fontSize: 12, fontFamily: 'Estedad-Bold' },
  heading: { fontSize: 26, fontFamily: 'Estedad-Black', color: '#17212a', marginTop: 8 },
  desc: { fontSize: 15, fontFamily: 'Estedad-Regular', color: '#6a7673', lineHeight: 24 },
  label: { color: '#52615e', fontSize: 13, fontFamily: 'Estedad-Bold', marginTop: 8 },
  docBtn: {
    minHeight: 140, borderWidth: 1.5, borderColor: '#dfe8e4', borderRadius: 18,
    backgroundColor: '#fff', overflow: 'hidden', borderStyle: 'dashed',
  },
  docImage: { width: '100%', height: 140, resizeMode: 'cover' },
  docPlaceholder: {
    flex: 1, alignItems: 'center', justifyContent: 'center', height: 140,
  },
  docIcon: { fontSize: 32 },
  docText: { fontSize: 13, fontFamily: 'Estedad-Regular', color: '#6a7673', marginTop: 6 },
  submitBtn: {
    minHeight: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#07846c', marginTop: 24,
  },
  submitText: { color: '#fff', fontSize: 17, fontFamily: 'Estedad-Bold' },
  disabledBtn: { opacity: 0.6 },
});

export default styles;
