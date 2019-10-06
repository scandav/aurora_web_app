from flask import render_template
from app import app, db
from app.models import PVData
from utils.bokeh_charts import BokehPwrHist, provide_dow, provide_month
from datetime import datetime as dt
from datetime import timedelta

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/daily')
@app.route('/daily/<date>')
def daily(date=dt.today().strftime('%Y-%m-%d')):
    db_list = PVData.query \
              .with_entities(PVData.created, PVData.grid_power, PVData.nrg_td) \
              .filter(PVData.created > date) \
              .filter(PVData.created < dt.strptime(date, '%Y-%m-%d')+timedelta(days=1)) \
              .order_by(PVData.created) \
              .all()
    script, div = BokehPwrHist(db_list).create_hist()
    
    day = dt.strptime(date, '%Y-%m-%d')
    day_string = ' '.join([provide_dow(day.weekday()), str(day.day), provide_month(day.month), str(day.year)])
    prev_day = (day - timedelta(days=1)).strftime('%Y-%m-%d')
    next_day = (day + timedelta(days=1)).strftime('%Y-%m-%d')
    
    return render_template('daily_production_chart.html', div=div, script=script, day=day_string, next_day=next_day, prev_day=prev_day)