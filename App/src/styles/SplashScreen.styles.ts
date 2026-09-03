import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#063c34',
  },
  logoBox: {
    width: 106,
    height: 106,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(255,255,255,0.13)',
  },
  carShape: {
    width: 54,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffbe4d',
    position: 'relative',
  },
  carRoof: {
    position: 'absolute',
    top: -8,
    right: 15,
    width: 24,
    height: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  title: {
    marginTop: 20,
    fontSize: 34,
    fontFamily: 'Estedad-Black',
    color: '#ffffff',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    fontFamily: 'Estedad-Regular',
    color: 'rgba(255,255,255,0.78)',
  },
});

export default styles;
