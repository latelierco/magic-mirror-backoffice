const config = {
	VIDEO_VIEWPORT: {
		WIDTH: 640
	},
	DELAY: 1500,
	HTTP_SERVICE: {
		URL: '127.0.0.1',
		PORT: 7000
	},
	USER_GROUP: 'latelier-co',
	CONTENT: {
		VISIBLE_INTENSITIES: [
			{
				label: 'Sombre',
				value: 'dimmed'
			},
			{
				label: 'Normal',
				value: 'normal'
			},
			{
				label: 'Clair',
				value: 'bright'
			}
		],
		PAGE_POSTIONS: [
			{
				label: 'Top Bar',
				value: 'top_bar'
			},
			{
				label: 'Bottom Bar',
				value: 'bottom_bar'
			},
			{
				label: 'Top Left',
				value: 'top_left'
			},
			{
				label: 'Bottom Left',
				value: 'bottom_left'
			},
			{
				label: 'Top Center',
				value: 'top_center'
			},
			{
				label: 'Bottom Center',
				value: 'bottom_center'
			},
			{
				label: 'Top Right',
				value: 'top_right'
			},
			{
				label: 'Bottom Right',
				value: 'bottom_right'
			},
			{
				label: 'Upper Third',
				value: 'upper_third'
			},
			{
				label: 'Middle Center',
				value: 'middle_center'
			},
			{
				label: 'Lower Third',
				value: 'lower_third'
			}
		],
		FONT_SIZES: [
			{
				label: 'Très Petit',
				value: 'xsmall',
			},
			{
				label: 'Petit',
				value: 'small',
			},
			{
				label: 'Moyen',
				value: 'medium',
			},
			{
				label: 'Moyen Plus',
				value: 'semi-medium',
			},
			{
				label: 'Grand',
				value: 'large',
			},
			{
				label: 'Très Grand',
				value: 'xlarge'
			}
		],
		FONT_WEIGHTS: [
			{
				label: 'Fin',
				value: 'thin'
			},
			{
				label: 'Fin Plus',
				value: 'semi-thin'
			},
			{
				label: 'Léger',
				value: 'light'
			},
			{
				label: 'Normal',
				value: 'regular'
			},
			{
				label: 'Gras',
				value: 'bold'
			}
		],
		TEXT_ALIGNS: [
			{
				label: 'A Gauche',
				value: 'align-left'
			},
			{
				label: 'Au Centre',
				value: 'align-center'
			},
			{
				label: 'A Droite',
				value: 'align-right'
			}
		]
	}
}


export default config
