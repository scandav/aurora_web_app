from flask import render_template
from app import app, db
from app.models import PVData
from utils.bokeh_charts import BokehPwrHist, provide_dow, provide_month
from datetime import datetime as dt
from datetime import timedelta
from dateutil.relativedelta import relativedelta
from sqlalchemy import func

@app.route('/')
def index():
    latest_rec = PVData.query \
                 .filter(PVData.created > dt.today().strftime('%Y-%m-%d')) \
                 .order_by(PVData.id.desc()) \
                 .first()
    grid_power = latest_rec.grid_power
    pwr_peak_td = latest_rec.pwr_peak_td
    nrg_td = round(latest_rec.nrg_td/1E3, 2)
    nrg_total = int(latest_rec.nrg/1E3)
    week_recs = PVData.query \
                .with_entities(PVData.created, PVData.nrg) \
                .filter(PVData.created >= (dt.now() - timedelta(days=7))) \
                .order_by(PVData.id).all()
    nrg_7days = int((week_recs[-1].nrg - week_recs[0].nrg)/1E3)
    year_recs = PVData.query \
                .with_entities(PVData.created, PVData.nrg) \
                .filter(func.strftime('%Y', PVData.created) == str(dt.now().year)) \
                .order_by(PVData.id).all()
    nrg_current_year = int((year_recs[-1].nrg - year_recs[0].nrg)/1E3)
    
    incent_current_year = nrg_current_year * app.config['INCENTIVES']
    incent_7days = nrg_7days * app.config['INCENTIVES']
    operating_time = (dt.today() - dt.strptime(app.config['START_DATE'], '%Y-%m-%d')).days
    year = dt.today().year
    
    return render_template("index.html", grid_power=grid_power, pwr_peak_td=pwr_peak_td, nrg_td=nrg_td,
                           nrg_7days=nrg_7days, nrg_current_year=nrg_current_year, nrg_total=nrg_total,
                           incent_current_year=incent_current_year, incent_7days=incent_7days,
                           operating_time=operating_time, year=year)

@app.route('/daily', defaults={'date': dt.today})
@app.route('/daily/<date>')
def daily(date):
    if hasattr(date, '__call__'):
        date = date().strftime('%Y-%m-%d')
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


@app.route('/monthly', defaults={'date': dt.today})
@app.route('/monthly/<date>')
def monthly(date):
    if hasattr(date, '__call__'):
        date = date().strftime('%Y-%m')

    db_list = PVData.query\
        .with_entities(func.strftime('%Y-%m-%d', PVData.created).label('created'),
                       func.max(PVData.nrg_td).label('nrg_td'))\
        .filter(PVData.created > date) \
        .filter(PVData.created < dt.strptime(date, '%Y-%m') + relativedelta(months=1))\
        .group_by(func.strftime('%Y-%m-%d', PVData.created))\
        .all()

    script, div = BokehPwrHist(db_list, type='monthly').create_hist()

    month = dt.strptime(date, '%Y-%m')
    month_string = ' '.join([provide_month(month.month), str(month.year)])
    prev_month = (month - relativedelta(months=1)).strftime('%Y-%m')
    next_month = (month + relativedelta(months=1)).strftime('%Y-%m')

    return render_template('monthly_production_chart.html', div=div, script=script, month=month_string, next_month=next_month,
                           prev_month=prev_month)