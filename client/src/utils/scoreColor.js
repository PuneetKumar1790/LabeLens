export const scoreColor = (score) => {
  if (score <= 3.9) return { text: '#FF4545', label: 'Poor', bg: '#FF454515' }
  if (score <= 6.4) return { text: '#F5A524', label: 'Okay', bg: '#F5A52415' }
  if (score <= 7.9) return { text: '#4ADE80', label: 'Good', bg: '#4ADE8015' }
  return { text: '#D4F53C', label: 'Excellent', bg: '#D4F53C15' }
}
