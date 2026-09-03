import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8faf9' },
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  carIcon: {
    width: 35,
    height: 19,
    borderRadius: 10,
    backgroundColor: '#ffbe4d',
    position: 'relative',
  },
  carRoof: {
    position: 'absolute',
    top: -5,
    right: 9,
    width: 17,
    height: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  brandName: {
    fontSize: 18,
    fontFamily: 'Estedad-Black',
    color: '#17212a',
  },
  authCopy: {
    marginTop: 12,
    gap: 8,

  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#e1f6f0',
  },
  badgeText: {
    color: '#07846c',
    fontSize: 12,
    fontFamily: 'Estedad-Black',
    
  },
  heading: {
    fontSize: 26,
    fontFamily: 'Estedad-Black',
    color: '#17212a',
    marginTop: 16,
  },
  desc: {
    fontSize: 15,
    fontFamily: 'Estedad-Regular',
    color: '#6a7673',
    lineHeight: 24,
  },
  label: {
    color: '#52615e',
    fontSize: 13,
    fontFamily: 'Estedad-Bold',
    marginTop: 8,
  },
  phoneField: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    minHeight: 58,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#dfe8e4',
    borderRadius: 18,
    backgroundColor: '#fff',
    gap: 12,
  },
  countryCode: {
    color: '#07846c',
    fontFamily: 'Estedad-Black',
    fontSize: 16,
  },
  phoneInput: {
    flex: 1,
    borderWidth: 0,
    fontSize: 18,
    fontFamily: 'Estedad-Regular',
    color: '#17212a',
    paddingVertical: 14,
    writingDirection: 'ltr',
  },
  primaryBtn: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#07846c',
    marginTop: 12,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: 'Estedad-Bold',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  secondaryBtn: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e9efed',
  },
  secondaryBtnText: {
    color: '#17212a',
    fontSize: 15,
    fontFamily: 'Estedad-Bold',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingBottom: 24,
  },
  signupText: {
    fontFamily: 'Estedad-Regular',
    color: '#6a7673',
  },
  signupLink: {
    fontFamily: 'Estedad-Black',
    color: '#07846c',
  },
});

export default styles;
