import { StyleSheet, Platform } from 'react-native';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8faf9' },
  flex: { flex: 1 },
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
  avatarBtn: {
    width: 110, height: 110, borderRadius: 55, alignSelf: 'center',
    overflow: 'hidden', borderWidth: 2, borderColor: '#dfe8e4', borderStyle: 'dashed',
  },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: {
    flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4f2',
  },
  avatarIcon: { fontSize: 28 },
  avatarText: { fontSize: 11, fontFamily: 'Estedad-Regular', color: '#6a7673', marginTop: 4 },
  label: { color: '#52615e', fontSize: 13, fontFamily: 'Estedad-Bold', marginTop: 8 , },
  input: {
    height: 54, paddingHorizontal: 16,
    borderWidth: 1, borderColor: '#dfe8e4',
    borderRadius: 18, backgroundColor: '#fff', fontSize: 16,
    fontFamily: 'Estedad-Regular', color: '#17212a', textAlign: 'right',
    textAlignVertical: 'center',
  },
  radioRow: { flexDirection: 'row-reverse', gap: 12 },
  radioBtn: {
    flex: 1, minHeight: 48, borderRadius: 14, borderWidth: 1.5,
    borderColor: '#dfe8e4', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
  },
  radioBtnActive: { borderColor: '#07846c', backgroundColor: '#e1f6f0' },
  radioText: { fontSize: 15, fontFamily: 'Estedad-Bold', color: '#6a7673' },
  radioTextActive: { color: '#07846c' },
  select: {
    minHeight: 54, paddingHorizontal: 16, borderWidth: 1, borderColor: '#dfe8e4',
    borderRadius: 18, backgroundColor: '#fff', justifyContent: 'center',
    flexDirection: Platform.OS === 'android' ? 'row-reverse' : 'row', alignItems: 'center',
  },
  selectText: { flex: 1, fontSize: 16, fontFamily: 'Estedad-Regular', color: '#17212a', textAlign: Platform.OS === 'android' ? 'left' : 'right'},
  selectArrow: { fontSize: 10, color: '#aaa', marginLeft: 8 },
  placeholder: { color: '#aaa' },
  selectOption: {
    paddingVertical: 12, paddingHorizontal: 20, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#eef2f0',
  },
  selectOptionText: { fontSize: 15, fontFamily: 'Estedad-Regular', color: '#17212a', textAlign: 'left' },
  primaryBtn: {
    minHeight: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#07846c', marginTop: 16,
  },
  primaryBtnText: { color: '#fff', fontSize: 17, fontFamily: 'Estedad-Bold' },
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '60%', paddingBottom: 30,
  },
  modalTitle: {
    fontSize: 18, fontFamily: 'Estedad-Bold', color: '#17212a',
    textAlign: 'center', paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#eef2f0',
  },
  modalItem: {
    paddingVertical: 14, paddingHorizontal: 24,
    borderBottomWidth: 1, borderBottomColor: '#eef2f0',
  },
  modalItemActive: { backgroundColor: '#e1f6f0' },
  modalItemText: { fontSize: 16, fontFamily: 'Estedad-Regular', color: '#17212a', textAlign: Platform.OS === 'android' ? 'left' : 'right' },
  modalItemTextActive: { color: '#07846c', fontFamily: 'Estedad-Bold' },
  modalSearch: {
    marginHorizontal: 16, marginTop: 12, marginBottom: 4,
    height: 44, paddingHorizontal: 16, borderWidth: 1, borderColor: '#dfe8e4',
    borderRadius: 12, backgroundColor: '#f8faf9', fontSize: 15,
    fontFamily: 'Estedad-Regular', color: '#17212a', textAlign: 'right',
  },
});

export default styles;
