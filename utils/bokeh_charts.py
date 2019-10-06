from bokeh.plotting import figure
from bokeh.models import ColumnDataSource, HoverTool
from bokeh.embed import components

class BokehPwrHist:
    def __init__(self, db_list):
        db_dict = dict(power=[a.grid_power for a in db_list], created=[a.created for a in db_list])

        self.db_src = ColumnDataSource(db_dict)
        nrg_day = round(db_list[-1].nrg_td / 1E3, 1) if db_list else 0
        
        self.p = figure(plot_width=720, 
                        plot_height=450,
                        x_axis_type='datetime',
                        x_axis_label='Orario', 
                        y_axis_label='Potenza [W]',
                        title='Produzione Odierna: {} kWh'.format(nrg_day))

        self.p.vbar(x='created', top='power', source=self.db_src, width=5*60*1000, fill_color="#b3de69")

    # Add style to the plot
        self.p.title.align = 'center'
        self.p.title.text_font_size = '18pt'
        self.p.xaxis.axis_label_text_font_size = '12pt'
        self.p.xaxis.major_label_text_font_size = '12pt'
        self.p.yaxis.axis_label_text_font_size = '12pt'
        self.p.yaxis.major_label_text_font_size = '12pt'
        self.p.y_range.start = 0


    # Add a hover tool referring to the formatted columns
        hover = HoverTool(tooltips=[('Ora', '@created{%H:%M}'),
                                    ('Potenza [W]', '@power')],
                          formatters={'created': 'datetime'})

        self.p.add_tools(hover)


    def create_hist(self):
        return components(self.p)


def provide_dow(string):
    dows = {0: 'Lunedì', 1: 'Martedì', 2: 'Mercoledì', 3: 'Giovedì', 4: 'Venerdì', 5: 'Sabato', 6: 'Domenica'}
    return dows[string]

def provide_month(string):
    months = dict(zip(range(1, 13), ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                                     'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']))
    return months[string]
