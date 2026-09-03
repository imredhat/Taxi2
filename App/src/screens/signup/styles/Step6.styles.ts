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
  label: { color: '#52615e', fontSize: 13, fontFamily: 'Estedad-Bold', marginTop: 8 },
  input: {
    height: 54, paddingHorizontal: 16,
    borderWidth: 1, borderColor: '#dfe8e4',
    borderRadius: 18, backgroundColor: '#fff', fontSize: 16,
    fontFamily: 'Estedad-Regular', color: '#17212a', textAlign: 'right',
    textAlignVertical: 'center',
  },
  ltr: { writingDirection: 'ltr', textAlign: 'left' },
  select: {
    minHeight: 54, paddingHorizontal: 16, borderWidth: 1, borderColor: '#dfe8e4',
    borderRadius: 18, backgroundColor: '#fff', justifyContent: 'center',
    flexDirection: Platform.OS === 'android' ? 'row-reverse' : 'row', alignItems: 'center',
  },
  selectText: { flex: 1, fontSize: 16, fontFamily: 'Estedad-Regular', color: '#17212a', textAlign: 'right' },
  selectArrow: { fontSize: 10, color: '#aaa', marginLeft: 8 },
  placeholder: { color: '#aaa' },
  dropdown: {
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#dfe8e4',
    maxHeight: 200, overflow: 'scroll',
  },
  dropdownItem: {
    paddingVertical: 12, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#eef2f0',
  },
  dropdownText: { fontSize: 15, fontFamily: 'Estedad-Regular', color: '#17212a', textAlign: 'right' },
  plateRow: {
    flexDirection: 'row-reverse', gap: 6, alignItems: 'center',
  },
  plateInput: {
    height: 48, borderWidth: 1, borderColor: '#dfe8e4', borderRadius: 12,
    backgroundColor: '#fff', fontSize: 16, fontFamily: 'Estedad-Bold',
    color: '#17212a', textAlign: 'center',
  },
  platePart: { width: 62 },
  plateLetter: { width: 52, alignItems: 'center', justifyContent: 'center' },
  plateLetterText: { fontSize: 16, fontFamily: 'Estedad-Bold', color: '#17212a' },
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
  modalSearch: {
    marginHorizontal: 16, marginTop: 12, marginBottom: 4,
    height: 44, paddingHorizontal: 16, borderWidth: 1, borderColor: '#dfe8e4',
    borderRadius: 12, backgroundColor: '#f8faf9', fontSize: 15,
    fontFamily: 'Estedad-Regular', color: '#17212a', textAlign: 'right',
  },
  modalItem: {
    paddingVertical: 14, paddingHorizontal: 24,
    borderBottomWidth: 1, borderBottomColor: '#eef2f0',
  },
  modalItemActive: { backgroundColor: '#e1f6f0' },
  modalItemText: { fontSize: 16, fontFamily: 'Estedad-Regular', color: '#17212a', textAlign: 'right' },
  modalItemTextActive: { color: '#07846c', fontFamily: 'Estedad-Bold' },
});

export default styles;
