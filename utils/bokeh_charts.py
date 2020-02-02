from bokeh.plotting import figure
from bokeh.models import ColumnDataSource, HoverTool, Span
from bokeh.embed import components
from datetime import datetime as dt


class BokehPwrHist:
    def __init__(self, db_list, type='daily'):

        if type == 'daily':
            db_dict = dict(power=[a.grid_power for a in db_list], created=[a.created for a in db_list])
            self.top_vbar = 'power'
            self.x_axis_label = 'Orario'
            self.y_axis_label = 'Potenza [W]'
            self.width = 5*60*1000
            hover = HoverTool(tooltips=[('Ora', '@created{%H:%M}'),
                                        ('Potenza [W]', '@power')],
                              formatters={'created': 'datetime'})

        elif type == 'monthly':
            db_dict = dict(energy=[round(a.nrg_td/1E3, 1) for a in db_list], created=[dt.strptime(a.created, '%Y-%m-%d') for a in db_list])
            nrg_month = sum(db_dict['energy']) if db_dict['energy'] else 0
            self.top_vbar = 'energy'
            self.x_axis_label = 'Giorno'
            self.y_axis_label = 'Energia [kWh]'
            self.width = 24*60*60*1000
            hover = HoverTool(tooltips=[('Giorno', '@created{%d-%m}'),
                                        ('Energia [kWh]', '@energy')],
                              formatters={'created': 'datetime'})

        self.db_src = ColumnDataSource(db_dict)

        self.p = figure(plot_width=720, 
                        plot_height=450,
                        x_axis_type='datetime',
                        x_axis_label=self.x_axis_label,
                        y_axis_label=self.y_axis_label,
                        sizing_mode="scale_both")

        if type == 'monthly' and db_list:
            avg_nrg = Span(location=nrg_month/len(db_dict['energy']),
                           dimension='width', line_color='red',
                           line_dash='dashed', line_width=3)
            self.p.add_layout(avg_nrg)

        self.p.vbar(x='created', top=self.top_vbar, source=self.db_src, width=self.width, fill_color="#41da25")

    # Add style to the plot
        self.p.title.align = 'center'
        self.p.title.text_font_size = '18pt'
        self.p.xaxis.axis_label_text_font_size = '12pt'
        self.p.xaxis.major_label_text_font_size = '12pt'
        self.p.yaxis.axis_label_text_font_size = '12pt'
        self.p.yaxis.major_label_text_font_size = '12pt'
        self.p.y_range.start = 0
        self.p.background_fill_color = (233, 252, 228)
        self.p.border_fill_color = (233, 252, 228)
        self.p.title.text_color = (53, 66, 74)

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
